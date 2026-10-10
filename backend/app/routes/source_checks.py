from fastapi import APIRouter, HTTPException

from app.data import db
from app.services.tinyfish import run_source_check, source_profile_for_claim


router = APIRouter(prefix="/api/source-checks", tags=["source checks"])
_observations = {}


@router.get("/{claim_id}")
def get_source_check(claim_id: str):
    claim = next((item for item in db.claims if item["id"] == claim_id), None)
    if claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    profile = source_profile_for_claim(claim)
    return _observations.get(claim_id) or {
        "status": "NOT_RUN" if profile else "UNSUPPORTED",
        "scope": profile["scope"] if profile else None,
        "sourceUrl": profile["url"] if profile else None,
        "sourceLabel": profile["label"] if profile else None,
        "claimMatch": "NOT_CHECKED",
        "issuerAttestation": "NOT_CHECKED",
        "message": "Run a public-source observation to see current source context." if profile else "No approved public source is configured for this claim type.",
    }


@router.post("/{claim_id}/run")
def start_source_check(claim_id: str):
    claim = next((item for item in db.claims if item["id"] == claim_id), None)
    if claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    observation = run_source_check(claim)
    _observations[claim_id] = observation
    return observation


def clear_source_checks():
    _observations.clear()

