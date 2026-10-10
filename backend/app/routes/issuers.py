from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.data import db
import time

router = APIRouter(prefix="/api/issuers", tags=["issuers"])

class RegisterIssuerPayload(BaseModel):
    name: str
    jurisdiction: str
    address: str
    publicKeyUri: Optional[str] = "https://veritas.network/keys/custom.pub"

@router.get("")
def list_issuers():
    return db.issuers

@router.post("/register")
def register_issuer(payload: RegisterIssuerPayload):
    new_id = f"iss-{len(db.issuers) + 1}"
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    issuer = {
        "id": new_id,
        "name": payload.name,
        "jurisdiction": payload.jurisdiction,
        "address": payload.address,
        "publicKeyUri": payload.publicKeyUri,
        "isVerified": True,
        "isRevoked": False,
        "registeredAt": now_iso,
        "documentsIssued": 0,
        "claimsIssued": 0,
        "revocationCount": 0
    }
    db.issuers.append(issuer)

    db.audit_trail.insert(0, {
        "id": f"aud-{len(db.audit_trail) + 1}",
        "timestamp": now_iso,
        "actor": "Issuer Registry Administrator",
        "action": "ISSUER_REGISTERED_AND_VERIFIED",
        "object": f"Issuer {payload.name} ({new_id})",
        "details": f"Registered authority under address {payload.address}",
        "txHash": None,
        "blockNumber": None
    })

    return issuer

@router.post("/{issuer_id}/toggle-verify")
def toggle_verify_issuer(issuer_id: str):
    issuer = next((i for i in db.issuers if i["id"] == issuer_id), None)
    if not issuer:
        raise HTTPException(status_code=404, detail="Issuer not found")

    issuer["isVerified"] = not issuer["isVerified"]
    action_str = "ISSUER_VERIFIED" if issuer["isVerified"] else "ISSUER_SUSPENDED"

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    db.audit_trail.insert(0, {
        "id": f"aud-{len(db.audit_trail) + 1}",
        "timestamp": now_iso,
        "actor": "Issuer Registry Administrator",
        "action": action_str,
        "object": f"Issuer {issuer['name']}",
        "details": f"Verification status changed to {issuer['isVerified']}",
        "txHash": None,
        "blockNumber": None
    })

    return issuer
