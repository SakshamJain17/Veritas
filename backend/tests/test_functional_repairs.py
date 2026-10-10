import os
import tempfile
import unittest
from copy import deepcopy

os.environ["VERITAS_DISABLE_PERSISTENCE"] = "1"

from app.data import db
from app.routes.issuers import RegisterIssuerPayload, TransitionPayload, register_issuer, transition_issuer
from app.services.extractor import process_uploaded_document
from app.services.contradiction import scan_for_contradictions, resolve_contradiction


class FunctionalRepairTests(unittest.TestCase):
    def setUp(self):
        self.snapshot = {key: deepcopy(getattr(db, key)) for key in ("documents","claims","issuers","contradictions","audit_trail")}

    def tearDown(self):
        for key, value in self.snapshot.items(): setattr(db, key, value)

    def test_issuer_lifecycle_and_invalid_duplicate(self):
        issuer = register_issuer(RegisterIssuerPayload(name="Test Land Office", jurisdiction="Test District", address="local-test"))
        self.assertEqual(issuer["status"], "PENDING_VERIFICATION")
        issuer = transition_issuer(issuer["id"], TransitionPayload(action="VERIFY", reason="Registry documents checked"))
        self.assertEqual(issuer["status"], "VERIFIED")
        issuer = transition_issuer(issuer["id"], TransitionPayload(action="SUSPEND", reason="Credential review opened"))
        self.assertEqual(issuer["status"], "SUSPENDED")
        issuer = transition_issuer(issuer["id"], TransitionPayload(action="REINSTATE", reason="Credential review completed"))
        issuer = transition_issuer(issuer["id"], TransitionPayload(action="REVOKE", reason="Authority mandate withdrawn"))
        self.assertEqual(issuer["status"], "REVOKED")
        self.assertEqual(len(issuer["statusHistory"]), 5)
        with self.assertRaises(Exception): transition_issuer(issuer["id"], TransitionPayload(action="REVOKE", reason="Duplicate revocation"))

    def test_pdf_extraction_uses_source_values_and_coordinates(self):
        import fitz
        pdf = fitz.open(); page = pdf.new_page()
        page.insert_text((72,100), "Survey Number: 77/9")
        page.insert_text((72,130), "Recorded Owner: Asha Verma")
        page.insert_text((72,160), "Registered Area: 3.5 acres")
        raw = pdf.tobytes(); pdf.close()
        doc, claims = process_uploaded_document("Unrelated filename", "Land Record", "English", raw, mime_type="application/pdf")
        values = {claim["predicate"]: claim["object"] for claim in claims}
        self.assertEqual(values["ownedBy"], "Asha Verma")
        self.assertEqual(values["surveyNumber"], "77/9")
        self.assertEqual(values["registeredArea"], "3.5 acres")
        self.assertTrue(all(claim["evidenceRegion"]["width"] > 0 for claim in claims))
        self.assertEqual(doc["extractionSummary"]["claimsMapped"], 3)

    def test_missing_fields_are_not_invented(self):
        import fitz
        pdf = fitz.open(); page = pdf.new_page(); page.insert_text((72,100), "General notice with no property fields")
        doc, claims = process_uploaded_document("Owner Rahul in filename", "Land Record", "English", pdf.tobytes(), mime_type="application/pdf")
        self.assertEqual(claims, [])
        self.assertEqual(doc["status"], "PARTIAL")

    def test_contextual_conflict_is_stable_and_review_survives_rescan(self):
        base = deepcopy(db.claims[0]); other = deepcopy(base)
        base.update(id="test-a", sourceDocumentId="doc-1", object="Asha Verma", rawSnippet="Recorded Owner: Asha Verma", evidenceMappingStatus="MAPPED")
        other.update(id="test-b", sourceDocumentId="doc-3", object="Neha Verma", rawSnippet="Recorded Owner: Neha Verma", evidenceMappingStatus="MAPPED")
        db.claims = [base, other]
        conflicts = scan_for_contradictions(); self.assertEqual(len(conflicts), 1)
        conflict_id = conflicts[0]["id"]
        self.assertIn("Asha Verma", conflicts[0]["explanation"])
        resolve_contradiction(conflict_id, "RESOLVE", "Transfer deed inspected")
        rescanned = scan_for_contradictions()[0]
        self.assertEqual(rescanned["id"], conflict_id)
        self.assertEqual(rescanned["status"], "RESOLVED_AFTER_REVIEW")

    def test_different_entities_do_not_conflict(self):
        a = deepcopy(db.claims[0]); b = deepcopy(a)
        a.update(id="entity-a", subject="Parcel 1", sourceDocumentId="doc-1", object="Asha")
        b.update(id="entity-b", subject="Parcel 2", sourceDocumentId="doc-3", object="Neha")
        db.claims = [a,b]
        self.assertEqual(scan_for_contradictions(), [])


if __name__ == "__main__": unittest.main()
