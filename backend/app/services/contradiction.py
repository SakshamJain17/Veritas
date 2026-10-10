from __future__ import annotations
from datetime import datetime, timezone
import hashlib
import re
from typing import Any, Dict, List, Optional
from app.data import db

def _norm(value: str) -> str:
    value = re.sub(r"[^\w./-]+", " ", value.casefold()).strip()
    number = re.fullmatch(r"([0-9]+(?:\.[0-9]+)?)\s*(acre|acres)", value)
    return f"{float(number.group(1)):g} acres" if number else value

def _utc() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def _jurisdiction(claim: dict[str, Any]) -> str:
    issuer = next((i for i in db.issuers if i["id"] == claim.get("issuerId")), None)
    return _norm(issuer.get("jurisdiction", "")) if issuer else ""

def _stable_id(group: list[dict[str, Any]]) -> str:
    ids = "|".join(sorted(c["id"] for c in group))
    context = f"{_norm(group[0]['subject'])}|{_norm(group[0]['predicate'])}|{ids}"
    return "conf-" + hashlib.sha256(context.encode()).hexdigest()[:16]

def scan_for_contradictions() -> List[Dict[str, Any]]:
    previous = {item["id"]: item for item in db.contradictions}
    for claim in db.claims:
        claim["hasConflict"] = False
        claim["conflictId"] = None
        if claim.get("verificationStatus") == "CONFLICT": claim["verificationStatus"] = "PENDING_REVIEW"
    groups: Dict[str, List[Dict[str, Any]]] = {}
    for claim in db.claims:
        key = f"{_norm(claim['subject'])}::{_norm(claim['predicate'])}"
        groups.setdefault(key, []).append(claim)
    contradictions: list[dict[str, Any]] = []
    for group in groups.values():
        if len({c["sourceDocumentId"] for c in group}) < 2: continue
        jurisdictions = {_jurisdiction(c) for c in group if _jurisdiction(c)}
        values: Dict[str, List[Dict[str, Any]]] = {}
        for claim in group: values.setdefault(_norm(claim["object"]), []).append(claim)
        if len(values) <= 1: continue
        conflict_id = _stable_id(group)
        comparable = len(jurisdictions) <= 1
        evidence_complete = all(c.get("evidenceMappingStatus", "MAPPED") == "MAPPED" and c.get("rawSnippet") for c in group)
        status = "REQUIRES_HUMAN_REVIEW" if comparable and evidence_complete else "INSUFFICIENT_EVIDENCE"
        field = group[0].get("fieldName") or ("Recorded owner" if group[0]["predicate"] == "ownedBy" else group[0]["predicate"])
        sources = [{"claimId": c["id"], "documentId": c["sourceDocumentId"], "documentTitle": c["sourceDocumentName"], "value": c["object"], "page": c.get("sourcePage"), "snippet": c.get("rawSnippet"), "evidenceAvailable": c.get("evidenceMappingStatus", "MAPPED") == "MAPPED", "evidenceRegion": c.get("evidenceRegion")} for c in group]
        values_found = [{"value": items[0]["object"], "docCount": len({c['sourceDocumentId'] for c in items}), "docIds": list(dict.fromkeys(c["sourceDocumentId"] for c in items)), "docNames": list(dict.fromkeys(c["sourceDocumentName"] for c in items)), "pages": list(dict.fromkeys(c.get("sourcePage", 1) for c in items))} for items in values.values()]
        quoted = ", while ".join(f"{s['documentTitle']} states '{s['value']}' on page {s['page']}" for s in sources[:3])
        basis = f"Records identify the same subject '{group[0]['subject']}' and field '{field}'" + (" in the same jurisdiction" if comparable and jurisdictions else "")
        explanation = f"{basis}. {quoted}. The normalized values differ, so VERITAS flagged the discrepancy for human review. This does not determine which value is legally correct."
        old = previous.get(conflict_id, {})
        conflict = {"id": conflict_id, "field": field, "predicate": group[0]["predicate"], "entitySubject": group[0]["subject"], "valuesFound": values_found, "sources": sources, "comparisonBasis": basis, "uncertainties": ([] if comparable else ["Jurisdictions differ or cannot be established"]) + ([] if evidence_complete else ["One or more source regions are unavailable"]), "status": old.get("status", status), "severity": "HIGH" if group[0]["predicate"] == "ownedBy" else "MEDIUM", "explanation": explanation, "detectedAt": old.get("detectedAt", _utc()), "reviewAction": old.get("reviewAction"), "reviewerNotes": old.get("reviewerNotes"), "reviewedAt": old.get("reviewedAt"), "reviewHistory": old.get("reviewHistory", [])}
        contradictions.append(conflict)
        for claim in group:
            claim["hasConflict"] = True; claim["conflictId"] = conflict_id
            if claim.get("verificationStatus") != "REVOKED": claim["verificationStatus"] = "CONFLICT"
    db.contradictions = contradictions
    db.persist()
    return contradictions

def resolve_contradiction(conflict_id: str, action: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    mapping = {"DISMISS": "DISMISSED", "RESOLVE": "RESOLVED_AFTER_REVIEW", "FLAG_INCONSISTENCY": "UNRESOLVED"}
    if action not in mapping or not notes or len(notes.strip()) < 3:
        return None
    for conflict in db.contradictions:
        if conflict["id"] != conflict_id: continue
        event = {"action": action, "notes": notes.strip(), "timestamp": _utc(), "actor": "Human reviewer"}
        conflict.update({"status": mapping[action], "reviewAction": action, "reviewerNotes": notes.strip(), "reviewedAt": event["timestamp"]})
        conflict.setdefault("reviewHistory", []).append(event)
        db.persist()
        return conflict
    return None
