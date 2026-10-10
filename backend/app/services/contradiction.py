from typing import List, Dict, Any, Optional
from app.data import db

def scan_for_contradictions() -> List[Dict[str, Any]]:
    """
    Scans all structured claims across documents to identify conflicting claims
    sharing the same subject and predicate but different values.
    """
    claim_groups: Dict[str, List[Dict[str, Any]]] = {}

    for claim in db.claims:
        # Key by normalized subject and predicate
        key = f"{claim['subject'].strip().lower()}::{claim['predicate'].strip().lower()}"
        if key not in claim_groups:
            claim_groups[key] = []
        claim_groups[key].append(claim)

    contradictions = []
    conflict_idx = 1

    for key, group in claim_groups.items():
        if len(group) < 2:
            continue

        # Extract values
        val_map: Dict[str, List[Dict[str, Any]]] = {}
        for c in group:
            val_norm = c["object"].strip()
            if val_norm not in val_map:
                val_map[val_norm] = []
            val_map[val_norm].append(c)

        if len(val_map) > 1:
            # Conflict detected!
            values_found = []
            for val, items in val_map.items():
                doc_ids = list(set(it["sourceDocumentId"] for it in items))
                doc_names = list(set(it["sourceDocumentName"] for it in items))
                pages = list(set(it["sourcePage"] for it in items))
                values_found.append({
                    "value": val,
                    "docCount": len(items),
                    "docIds": doc_ids,
                    "docNames": doc_names,
                    "pages": pages
                })

            sample_item = group[0]
            field_name = sample_item["predicate"].capitalize()
            if field_name.lower() == "ownedby":
                field_name = "Owner"

            conf_id = f"conf-{conflict_idx}"
            conflict_idx += 1

            contradiction = {
                "id": conf_id,
                "field": field_name,
                "entitySubject": sample_item["subject"],
                "valuesFound": values_found,
                "status": "REQUIRES HUMAN REVIEW",
                "severity": "HIGH",
                "explanation": "VERITAS detected inconsistent claims across records. It does not determine legal ownership.",
                "detectedAt": "2026-09-29T08:35:42Z",
                "reviewAction": None,
                "reviewerNotes": None
            }
            contradictions.append(contradiction)

            # Mark claims with conflict
            for c in group:
                c["hasConflict"] = True
                c["conflictId"] = conf_id
                if c["verificationStatus"] != "REVOKED":
                    c["verificationStatus"] = "CONFLICT"

    # Merge with existing reviews if already answered
    existing_map = {c["id"]: c for c in db.contradictions if c.get("reviewAction")}
    for c in contradictions:
        if c["id"] in existing_map:
            c["status"] = existing_map[c["id"]]["status"]
            c["reviewAction"] = existing_map[c["id"]]["reviewAction"]
            c["reviewerNotes"] = existing_map[c["id"]]["reviewerNotes"]

    db.contradictions = contradictions
    return contradictions

def resolve_contradiction(conflict_id: str, action: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    for conf in db.contradictions:
        if conf["id"] == conflict_id:
            conf["status"] = "RESOLVED" if action in ["APPROVE", "FLAG_INCONSISTENCY"] else "DISMISSED"
            conf["reviewAction"] = action
            conf["reviewerNotes"] = notes or f"Reviewed by human auditor: {action}"
            return conf
    return None
