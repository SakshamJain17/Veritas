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

    # Historical trends for charts
    activity_timeline = [
        {"day": "Mon", "documents": 142, "claims": 890, "conflicts": 4},
        {"day": "Tue", "documents": 189, "claims": 1240, "conflicts": 7},
        {"day": "Wed", "documents": 210, "claims": 1420, "conflicts": 5},
        {"day": "Thu", "documents": 245, "claims": 1680, "conflicts": 8},
        {"day": "Fri", "documents": 280, "claims": 1910, "conflicts": 6},
        {"day": "Sat", "documents": 110, "claims": 710, "conflicts": 3},
        {"day": "Sun", "documents": 108, "claims": 571, "conflicts": 4},
    ]

    claims_by_predicate = [
        {"name": "Ownership Title", "count": 2410},
        {"name": "Survey Identifiers", "count": 1980},
        {"name": "Spatial Area", "count": 1450},
        {"name": "Statutory Dates", "count": 1320},
        {"name": "Licenses & Permits", "count": 1261}
    ]

    issuer_distribution = [
        {"name": "Sub-Registrar", "value": 45, "color": "#0ea5e9"},
        {"name": "Municipal Corp", "value": 35, "color": "#10b981"},
        {"name": "Universities", "value": 15, "color": "#8b5cf6"},
        {"name": "Transport Bureau", "value": 5, "color": "#f59e0b"}
    ]

    return {
        "kpis": {
            "documentsProcessed": 1284 + total_docs - 5,
            "claimsExtracted": 8421 + total_claims - 16,
            "claimsWithConflicts": 37 + (1 if conflicts > 1 else 0),
            "pendingVerification": 126 + pending,
            "documentIntegrityHealth": 98.7,
            "verificationActivityGrowth": 18.4,
            "issuerVerificationRate": 94.2
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
