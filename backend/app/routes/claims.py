from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.data import db
from app.services.blockchain import anchor_to_ledger
import time

router = APIRouter(prefix="/api/claims", tags=["claims"])


@router.get("")
def list_claims(
    document_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    has_conflict: Optional[bool] = Query(None),
    query: Optional[str] = Query(None)
):
    results = db.claims
    if document_id:
        results = [c for c in results if c["sourceDocumentId"] == document_id]
    if status:
        results = [c for c in results if c["verificationStatus"].upper() == status.upper()]
    if has_conflict is not None:
        results = [c for c in results if c.get("hasConflict", False) == has_conflict]
    if query:
        q = query.lower()
        results = [
            c for c in results
            if q in c["subject"].lower()
            or q in c["predicate"].lower()
            or q in c["object"].lower()
            or q in c["issuerName"].lower()
        ]
    return results

@router.get("/{claim_id}")
def get_claim(claim_id: str):
    claim = next((c for c in db.claims if c["id"] == claim_id), None)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Include source document and related claims
    doc = next((d for d in db.documents if d["id"] == claim["sourceDocumentId"]), None)
    related_claims = [
        c for c in db.claims
        if c["id"] != claim_id and (
            c["subject"] == claim["subject"] or c["sourceDocumentId"] == claim["sourceDocumentId"]
        )
    ]
    conflict = None
    if claim.get("conflictId"):
        conflict = next((cf for cf in db.contradictions if cf["id"] == claim["conflictId"]), None)

    return {
        "claim": claim,
        "document": doc,
        "relatedClaims": related_claims,
        "conflict": conflict
    }

@router.post("/{claim_id}/anchor")
def anchor_claim(claim_id: str):
    claim = next((c for c in db.claims if c["id"] == claim_id), None)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    anchor_info = anchor_to_ledger(claim["id"], item_type="CLAIM")
    claim["blockchainAnchor"] = anchor_info

    # Log audit event
    db.audit_trail.insert(0, {
        "id": f"aud-{len(db.audit_trail) + 1}",
        "timestamp": anchor_info["timestamp"],
        "actor": "ClaimRegistry Gateway",
        "action": "CLAIM_ANCHORED_TO_BLOCKCHAIN",
        "object": f"{claim['predicate']} = {claim['object']}",
        "details": f"Anchored claim commitment to block #{anchor_info['blockNumber']}",
        "txHash": anchor_info["txHash"],
        "blockNumber": anchor_info["blockNumber"]
    })

    return {"claim": claim, "anchor": anchor_info}

@router.post("/{claim_id}/attest")
def attest_claim(claim_id: str):
    claim = next((c for c in db.claims if c["id"] == claim_id), None)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim["verificationStatus"] = "VERIFIED"
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    db.audit_trail.insert(0, {
        "id": f"aud-{len(db.audit_trail) + 1}",
        "timestamp": now_iso,
        "actor": "Authorized Verifier",
        "action": "CLAIM_HUMAN_ATTESTED",
        "object": f"{claim['predicate']} = {claim['object']}",
        "details": "Auditor verified visual evidence against official sub-registrar registry.",
        "txHash": None,
        "blockNumber": None
    })

    return {"claim": claim, "status": "ATTESTED"}

@router.post("/{claim_id}/revoke")
def revoke_claim(claim_id: str):
    claim = next((c for c in db.claims if c["id"] == claim_id), None)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim["verificationStatus"] = "REVOKED"
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    db.audit_trail.insert(0, {
        "id": f"aud-{len(db.audit_trail) + 1}",
        "timestamp": now_iso,
        "actor": "Security & Integrity Service",
        "action": "CLAIM_REVOKED",
        "object": f"{claim['predicate']} = {claim['object']}",
        "details": "Claim revoked due to verified counter-document evidence.",
        "txHash": None,
        "blockNumber": None
    })

    return {"claim": claim, "status": "REVOKED"}
