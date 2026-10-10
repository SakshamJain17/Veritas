from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal, Optional
from uuid import uuid4
from app.data import db

router = APIRouter(prefix="/api/issuers", tags=["issuers"])

class RegisterIssuerPayload(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    jurisdiction: str = Field(min_length=2, max_length=200)
    address: str = Field(min_length=3, max_length=200)
    publicKeyUri: Optional[str] = "https://veritas.network/keys/custom.pub"

class TransitionPayload(BaseModel):
    action: Literal["VERIFY", "SUSPEND", "REINSTATE", "REVOKE"]
    reason: str = Field(min_length=3, max_length=500)
    actor: str = Field(default="Local Registry Administrator", min_length=2, max_length=120)

ALLOWED = {
    "PENDING_VERIFICATION": {"VERIFY": "VERIFIED", "REVOKE": "REVOKED"},
    "VERIFIED": {"SUSPEND": "SUSPENDED", "REVOKE": "REVOKED"},
    "SUSPENDED": {"REINSTATE": "VERIFIED", "REVOKE": "REVOKED"},
    "REVOKED": {"REINSTATE": "VERIFIED"},
}

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

@router.get("")
def list_issuers():
    return db.issuers

@router.get("/{issuer_id}")
def get_issuer(issuer_id: str):
    issuer = next((item for item in db.issuers if item["id"] == issuer_id), None)
    if not issuer:
        raise HTTPException(status_code=404, detail="Issuer not found")
    return issuer

@router.post("/register", status_code=201)
def register_issuer(payload: RegisterIssuerPayload):
    now = now_iso()
    issuer = {
        "id": f"iss-{uuid4().hex[:12]}", "name": payload.name.strip(),
        "jurisdiction": payload.jurisdiction.strip(), "address": payload.address.strip(),
        "publicKeyUri": payload.publicKeyUri, "status": "PENDING_VERIFICATION",
        "isVerified": False, "isRevoked": False, "demoRecord": False,
        "registeredAt": now, "statusChangedAt": now,
        "statusReason": "Awaiting administrative verification", "revokedAt": None,
        "documentsIssued": 0, "claimsIssued": 0, "revocationCount": 0,
        "statusHistory": [{"from": None, "to": "PENDING_VERIFICATION", "action": "REGISTER", "reason": "New registration", "actor": "Local Registry Administrator", "timestamp": now}],
    }
    db.issuers.append(issuer)
    db.audit_trail.insert(0, {"id": f"aud-{uuid4().hex[:12]}", "timestamp": now, "actor": "Local Registry Administrator", "action": "ISSUER_REGISTERED", "object": f"Issuer {issuer['name']} ({issuer['id']})", "details": "Registered as PENDING_VERIFICATION; no certification has been granted.", "txHash": None, "blockNumber": None})
    db.persist()
    return issuer

@router.post("/{issuer_id}/transition")
def transition_issuer(issuer_id: str, payload: TransitionPayload):
    issuer = next((item for item in db.issuers if item["id"] == issuer_id), None)
    if not issuer:
        raise HTTPException(status_code=404, detail="Issuer not found")
    current = issuer.get("status", "VERIFIED" if issuer.get("isVerified") else "SUSPENDED")
    target = ALLOWED.get(current, {}).get(payload.action)
    if not target:
        raise HTTPException(status_code=409, detail=f"Cannot {payload.action.lower()} an issuer in {current} state")
    now = now_iso()
    issuer.update({"status": target, "isVerified": target == "VERIFIED", "isRevoked": target == "REVOKED", "statusChangedAt": now, "statusReason": payload.reason.strip(), "revokedAt": now if target == "REVOKED" else (None if payload.action == "REINSTATE" else issuer.get("revokedAt"))})
    if target == "REVOKED": issuer["revocationCount"] = issuer.get("revocationCount", 0) + 1
    issuer.setdefault("statusHistory", []).append({"from": current, "to": target, "action": payload.action, "reason": payload.reason.strip(), "actor": payload.actor.strip(), "timestamp": now})
    db.audit_trail.insert(0, {"id": f"aud-{uuid4().hex[:12]}", "timestamp": now, "actor": payload.actor.strip(), "action": f"ISSUER_{payload.action}", "object": f"Issuer {issuer['name']} ({issuer_id})", "details": f"{current} to {target}. Reason: {payload.reason.strip()}", "txHash": None, "blockNumber": None})
    db.persist()
    return issuer

@router.post("/{issuer_id}/toggle-verify", deprecated=True)
def deprecated_toggle(issuer_id: str):
    raise HTTPException(status_code=410, detail="Ambiguous toggle removed. Use /transition with an explicit action and reason.")
