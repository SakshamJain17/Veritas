from fastapi import APIRouter
from app.data import db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("")
def get_analytics():
    total_docs = len(db.documents)
    total_claims = len(db.claims)
    conflicts = len([c for c in db.claims if c.get("hasConflict", False)])
    pending = len([c for c in db.claims if c["verificationStatus"] == "PENDING_REVIEW"])
    verified = len([c for c in db.claims if c["verificationStatus"] == "VERIFIED"])
    anchored = len([c for c in db.claims if c["blockchainAnchor"]["isAnchored"]])

    by_predicate = {}
    by_issuer = {}
    for claim in db.claims:
        by_predicate[claim["predicate"]] = by_predicate.get(claim["predicate"], 0) + 1
        by_issuer[claim["issuerName"]] = by_issuer.get(claim["issuerName"], 0) + 1
    activity_timeline = []
    claims_by_predicate = [{"predicate": key, "count": value} for key, value in sorted(by_predicate.items())]
    issuer_distribution = [{"issuer": key, "count": value} for key, value in sorted(by_issuer.items())]
    verified_issuers = len([issuer for issuer in db.issuers if issuer.get("status") == "VERIFIED"])

    return {
        "kpis": {
            "documentsProcessed": total_docs,
            "claimsExtracted": total_claims,
            "claimsWithConflicts": conflicts,
            "pendingVerification": pending,
            "documentIntegrityHealth": round(100 * len([d for d in db.documents if d.get("hashSha256")]) / total_docs, 1) if total_docs else 0,
            "verificationActivityGrowth": 0,
            "issuerVerificationRate": round(100 * verified_issuers / len(db.issuers), 1) if db.issuers else 0
        },
        "activityTimeline": activity_timeline,
        "claimsByPredicate": claims_by_predicate,
        "issuerDistribution": issuer_distribution,
        "counts": {
            "totalDocs": total_docs,
            "totalClaims": total_claims,
            "verifiedClaims": verified,
            "conflicts": conflicts,
            "pendingClaims": pending,
            "anchoredClaims": anchored
        }
    }
