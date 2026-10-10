import time
import random
from typing import List, Dict, Any, Tuple
from app.services.blockchain import compute_sha256
from app.data import db

PIPELINE_STEPS = [
    {"step": 1, "name": "Document ingestion", "description": "Parsing multi-page scanned PDF/image format"},
    {"step": 2, "name": "Language detection", "description": "Detecting regional/multilingual scripts & orientation"},
    {"step": 3, "name": "OCR / visual extraction", "description": "High-density neural visual token extraction"},
    {"step": 4, "name": "Document structure analysis", "description": "Identifying headers, seals, stamps, and schedules"},
    {"step": 5, "name": "Entity extraction", "description": "Locating parties, survey numbers, parcels, and authorities"},
    {"step": 6, "name": "Claim generation", "description": "Converting extracted tokens into discrete structured claims"},
    {"step": 7, "name": "Evidence mapping", "description": "Calculating precise pixel coordinates & bounding boxes"},
    {"step": 8, "name": "Cross-document consistency check", "description": "Comparing extracted claims against existing record repository"},
    {"step": 9, "name": "Integrity fingerprint", "description": "Generating cryptographic SHA-256 document fingerprint"},
    {"step": 10, "name": "Verification package", "description": "Preparing a selected-evidence verification package"}
]

def process_uploaded_document(
    title: str,
    doc_type: str,
    language: str,
    raw_bytes: bytes,
    issuer_id: str = "iss-1"
) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Simulates or executes the 10-step AI extraction pipeline,
    extracting structured claims, computing SHA-256, and mapping evidence regions.
    """
    doc_id = f"doc-{len(db.documents) + 1}"
    doc_hash = compute_sha256(raw_bytes if raw_bytes else title.encode())

    issuer = next((i for i in db.issuers if i["id"] == issuer_id), db.issuers[0])

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # Generate document record
    doc_record = {
        "id": doc_id,
        "title": title,
        "documentType": doc_type,
        "language": language,
        "pageCount": 2,
        "fileSizeKb": max(1, len(raw_bytes) // 1024) if raw_bytes else 1420,
        "hashSha256": doc_hash,
        "uploadedAt": now_iso,
        "status": "EXTRACTED",
        "claimsCount": 0,
        "issuerId": issuer["id"],
        "issuerName": issuer["name"],
        "issuerAddress": issuer["address"],
        "isAnchored": False,
        "blockchainTx": None,
        "thumbnailUrl": "/docs/land_certificate.png",
        "previewPages": ["Page 1: Title Header & Seals", "Page 2: Registered Claims & Schedules"]
    }

    # Generate structured claims based on document type
    claims: List[Dict[str, Any]] = []

    if "land" in doc_type.lower() or "title" in title.lower():
        # Check if the title or filename hints at a contradiction
        is_contradictory = "rohan" in title.lower() or "disputed" in title.lower() or "mutation" in title.lower()
        owner_name = "Rohan Sharma" if is_contradictory else "Rahul Sharma"

        c1 = {
            "id": f"claim-{len(db.claims) + 1}",
            "subject": "Land Parcel 184/2",
            "predicate": "ownedBy",
            "object": owner_name,
            "confidence": 0.93 if is_contradictory else 0.97,
            "confidenceTier": "HIGH",
            "sourceDocumentId": doc_id,
            "sourceDocumentName": title,
            "sourcePage": 2 if not is_contradictory else 1,
            "evidenceRegion": {
                "page": 2 if not is_contradictory else 1,
                "x": 12.0,
                "y": 28.5,
                "width": 64.0,
                "height": 9.2
            },
            "rawSnippet": f"REVENUE ENTRY: Declared titleholder noted as {owner_name.upper()} under Cadastral Registry.",
            "issuerId": issuer["id"],
            "issuerName": issuer["name"],
            "issuerVerified": issuer["isVerified"],
            "createdAt": now_iso,
            "integrityStatus": "VERIFIED",
            "verificationStatus": "PENDING_REVIEW" if is_contradictory else "VERIFIED",
            "blockchainAnchor": {
                "isAnchored": False,
                "network": "VERITAS Demo Network (EVM Simulated)",
                "txHash": None,
                "blockNumber": None,
                "timestamp": None,
                "status": "UNANCHORED",
                "gasUsed": None,
                "contractAddress": None
            },
            "hasConflict": is_contradictory,
            "conflictId": "conf-1" if is_contradictory else None
        }
        claims.append(c1)

        c2 = {
            "id": f"claim-{len(db.claims) + 2}",
            "subject": "Land Parcel 184/2",
            "predicate": "surveyNumber",
            "object": "184/2",
            "confidence": 0.99,
            "confidenceTier": "HIGH",
            "sourceDocumentId": doc_id,
            "sourceDocumentName": title,
            "sourcePage": 1,
            "evidenceRegion": {
                "page": 1,
                "x": 14.0,
                "y": 42.0,
                "width": 45.0,
                "height": 7.5
            },
            "rawSnippet": "Survey Register: Block Sector 184/2.",
            "issuerId": issuer["id"],
            "issuerName": issuer["name"],
            "issuerVerified": issuer["isVerified"],
            "createdAt": now_iso,
            "integrityStatus": "VERIFIED",
            "verificationStatus": "VERIFIED",
            "blockchainAnchor": {
                "isAnchored": False,
                "network": "VERITAS Demo Network (EVM Simulated)",
                "txHash": None,
                "blockNumber": None,
                "timestamp": None,
                "status": "UNANCHORED",
                "gasUsed": None,
                "contractAddress": None
            },
            "hasConflict": False,
            "conflictId": None
        }
        claims.append(c2)

        c3 = {
            "id": f"claim-{len(db.claims) + 3}",
            "subject": "Land Parcel 184/2",
            "predicate": "registeredArea",
            "object": "2.4 acres",
            "confidence": 0.95,
            "confidenceTier": "HIGH",
            "sourceDocumentId": doc_id,
            "sourceDocumentName": title,
            "sourcePage": 2,
            "evidenceRegion": {
                "page": 2,
                "x": 14.0,
                "y": 52.0,
                "width": 38.0,
                "height": 7.5
            },
            "rawSnippet": "Total Measured Extent: 2.40 Acres arable parcel.",
            "issuerId": issuer["id"],
            "issuerName": issuer["name"],
            "issuerVerified": issuer["isVerified"],
            "createdAt": now_iso,
            "integrityStatus": "VERIFIED",
            "verificationStatus": "VERIFIED",
            "blockchainAnchor": {
                "isAnchored": False,
                "network": "VERITAS Demo Network (EVM Simulated)",
                "txHash": None,
                "blockNumber": None,
                "timestamp": None,
                "status": "UNANCHORED",
                "gasUsed": None,
                "contractAddress": None
            },
            "hasConflict": False,
            "conflictId": None
        }
        claims.append(c3)
    else:
        # Generic document claims
        c1 = {
            "id": f"claim-{len(db.claims) + 1}",
            "subject": title,
            "predicate": "beneficiaryName",
            "object": "Rahul Sharma",
            "confidence": 0.96,
            "confidenceTier": "HIGH",
            "sourceDocumentId": doc_id,
            "sourceDocumentName": title,
            "sourcePage": 1,
            "evidenceRegion": {
                "page": 1,
                "x": 15.0,
                "y": 25.0,
                "width": 55.0,
                "height": 8.0
            },
            "rawSnippet": "Authorized Name / Beneficiary: RAHUL SHARMA",
            "issuerId": issuer["id"],
            "issuerName": issuer["name"],
            "issuerVerified": issuer["isVerified"],
            "createdAt": now_iso,
            "integrityStatus": "VERIFIED",
            "verificationStatus": "VERIFIED",
            "blockchainAnchor": {
                "isAnchored": False,
                "network": "VERITAS Demo Network (EVM Simulated)",
                "txHash": None,
                "blockNumber": None,
                "timestamp": None,
                "status": "UNANCHORED",
                "gasUsed": None,
                "contractAddress": None
            },
            "hasConflict": False,
            "conflictId": None
        }
        claims.append(c1)

    doc_record["claimsCount"] = len(claims)

    return doc_record, claims
