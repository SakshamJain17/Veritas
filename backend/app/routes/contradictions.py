from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.data import db
from app.services.contradiction import scan_for_contradictions, resolve_contradiction
import time

router = APIRouter(prefix="/api/contradictions", tags=["contradictions"])

class ReviewPayload(BaseModel):
    action: str  # APPROVE, REJECT, FLAG_INCONSISTENCY, DISMISS
    notes: Optional[str] = None

@router.get("")
def list_contradictions():
    scan_for_contradictions()
    return db.contradictions

@router.post("/{conflict_id}/review")
def review_contradiction(conflict_id: str, payload: ReviewPayload):
    if payload.action not in {"DISMISS", "RESOLVE", "FLAG_INCONSISTENCY"}:
        raise HTTPException(status_code=422, detail="Action must be DISMISS, RESOLVE, or FLAG_INCONSISTENCY")
    if not payload.notes or len(payload.notes.strip()) < 3:
        raise HTTPException(status_code=422, detail="Review notes are required")
    updated = resolve_contradiction(conflict_id, payload.action, payload.notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Contradiction not found or invalid review")

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    db.audit_trail.insert(0, {
        "id": f"aud-{len(db.audit_trail) + 1}",
        "timestamp": now_iso,
        "actor": "Human In The Loop Auditor",
        "action": f"CONTRADICTION_REVIEWED_{payload.action}",
        "object": f"Contradiction {conflict_id} ({updated['field']})",
        "details": f"Action: {payload.action}. Notes: {payload.notes or 'None'}. (VERITAS notes AI extraction != legal truth)",
        "txHash": None,
        "blockNumber": None
    })
    db.persist()

    return updated
