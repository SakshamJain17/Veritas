from fastapi import APIRouter, HTTPException
import hashlib
import time
from app.data import db

router = APIRouter(prefix="/api/verify", tags=["verification"])

@router.get("/{claim_id}")
def verify_claim_public(claim_id: str):
    """Return a selected demo record; no independent attestation is performed."""
    claim = next((c for c in db.claims if c["id"] == claim_id), None)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim record not found or revoked")

    doc = next((d for d in db.documents if d["id"] == claim["sourceDocumentId"]), None)
    issuer = next((i for i in db.issuers if i["id"] == claim["issuerId"]), None)

    # Compute claim commitment hash
    claim_payload = f"{claim['subject']}|{claim['predicate']}|{claim['object']}|{claim['sourceDocumentId']}"
    claim_hash = f"0x{hashlib.sha256(claim_payload.encode()).hexdigest()}"

    # Cross-document consistency verification
    conflicting_claims = [
        c for c in db.claims
        if c["id"] != claim_id
        and c["subject"].lower() == claim["subject"].lower()
        and c["predicate"].lower() == claim["predicate"].lower()
        and c["object"].lower() != claim["object"].lower()
    ]
    is_cross_doc_consistent = len(conflicting_claims) == 0

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    document_hash = doc["hashSha256"] if doc else ""
    document_hash_well_formed = len(document_hash) == 66 and all(c in "0123456789abcdefABCDEF" for c in document_hash[2:])
    document_anchor_valid = bool(doc and doc.get("isAnchored") and document_hash_well_formed)
    claim_anchor_valid = bool(claim["blockchainAnchor"].get("isAnchored") and len(claim_hash) == 66)
    issuer_status = issuer.get("status", "VERIFIED" if issuer and issuer.get("isVerified") else "SUSPENDED") if issuer else "UNKNOWN"
    issuer_valid = issuer_status == "VERIFIED"
    evidence_available = bool(doc and doc.get("fileAvailable") and claim.get("evidenceMappingStatus", "MAPPED") == "MAPPED")

    # Log verification request to audit trail (third-party verifier)
    db.audit_trail.insert(0, {
        "id": f"aud-{len(db.audit_trail) + 1}",
        "timestamp": now_iso,
        "actor": "Independent Third-Party Verifier",
        "action": "PUBLIC_VERIFICATION_CHECK",
        "object": f"Claim {claim_id}: {claim['predicate']} = {claim['object']}",
        "details": "Public demo record viewed. No live blockchain or issuer check was performed.",
        "txHash": claim['blockchainAnchor']['txHash'],
        "blockNumber": claim['blockchainAnchor']['blockNumber']
    })

    return {
        "isVerified": False,
        "claim": {
            "id": claim["id"],
            "subject": claim["subject"],
            "predicate": claim["predicate"],
            "object": claim["object"],
            "confidence": claim["confidence"],
            "confidenceTier": claim["confidenceTier"],
            "claimHash": claim_hash,
            "verificationStatus": claim["verificationStatus"]
        },
        "evidence": {
            "documentTitle": doc["title"] if doc else "Public Record",
            "documentHash": document_hash or "N/A",
            "pageNumber": claim["sourcePage"],
            "evidenceRegion": claim["evidenceRegion"],
            "snippetText": claim["rawSnippet"],
            "availability": "AVAILABLE_RESTRICTED" if evidence_available else (doc.get("fileAccess", "NOT_RETAINED") if doc else "UNAVAILABLE"),
            "originalAvailable": evidence_available,
            "conflictEvidenceUnavailable": bool(claim.get("hasConflict") and not evidence_available),
            "privacyNotice": "The complete original is never exposed by public verification. Selected evidence is shown only when retained and permitted." if evidence_available else "Original evidence is unavailable from this public page. The previous comparison result is shown without substituting a fabricated source."
        },
        "issuer": {
            "name": issuer["name"] if issuer else claim["issuerName"],
            "jurisdiction": issuer["jurisdiction"] if issuer else "Official Registrar",
            "address": issuer["address"] if issuer else "0x0000000000000000000000000000000000000000",
            "isVerified": issuer_valid,
            "registryStatus": issuer_status,
            "statusReason": issuer.get("statusReason") if issuer else "Issuer record unavailable",
            "statusChangedAt": issuer.get("statusChangedAt") if issuer else None
        },
        "integrity": {
            "documentHashValid": False,
            "claimCommitmentValid": False,
            "tamperEvidentStatus": "DEMO_NOT_INDEPENDENTLY_VERIFIED"
        },
        "blockchain": claim["blockchainAnchor"],
        "crossDocumentConsistency": {
            "isConsistent": is_cross_doc_consistent,
            "contradictionCount": len(conflicting_claims),
            "status": "NOT_CHECKED" if len([c for c in db.claims if c["id"] != claim_id and c["subject"].lower() == claim["subject"].lower() and c["predicate"].lower() == claim["predicate"].lower()]) == 0 else ("CONSISTENT" if is_cross_doc_consistent else "CONTRADICTION_FLAGGED")
        },
        "timestamp": now_iso
    }

