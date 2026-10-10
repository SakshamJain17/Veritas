from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from app.data import db
from app.services.extractor import process_uploaded_document
from app.services.blockchain import anchor_to_ledger
from app.services.contradiction import scan_for_contradictions

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.get("")
def list_documents():
    return db.documents

@router.get("/{doc_id}")
def get_document(doc_id: str):
    doc = next((d for d in db.documents if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    claims = [c for c in db.claims if c["sourceDocumentId"] == doc_id]
    return {"document": doc, "claims": claims}

@router.post("/upload")
async def upload_document(
    title: str = Form(...),
    documentType: str = Form("Land Record"),
    language: str = Form("English"),
    issuerId: str = Form("iss-1"),
    advisorConsent: bool = Form(False),
    file: Optional[UploadFile] = File(None)
):
    content = await file.read(25 * 1024 * 1024 + 1) if file else b""
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Document exceeds the 25 MB upload limit")
    if file and content:
        signatures = {
            "application/pdf": content.startswith(b"%PDF-"),
            "image/png": content.startswith(b"\x89PNG\r\n\x1a\n"),
            "image/jpeg": content.startswith(b"\xff\xd8\xff"),
            "image/tiff": content.startswith((b"II*\x00", b"MM\x00*")),
        }
        if not signatures.get(file.content_type or "", False):
            raise HTTPException(status_code=415, detail="Unsupported or invalid file. Upload a valid PDF, PNG, JPEG, or TIFF.")
    title = " ".join(title.split())
    if not title or len(title) > 120:
        raise HTTPException(status_code=422, detail="Title must contain 1 to 120 characters")
    doc_record, claims = process_uploaded_document(
        title=title,
        doc_type=documentType,
        language=language,
        raw_bytes=content,
        issuer_id=issuerId
    )

    doc_record["advisorConsent"] = advisorConsent
    db.documents.append(doc_record)
    for c in claims:
        db.claims.append(c)

    # Re-scan for contradictions across all documents
    scan_for_contradictions()

    # Log to audit trail
    db.audit_trail.insert(0, {
        "id": f"aud-{len(db.audit_trail) + 1}",
        "timestamp": doc_record["uploadedAt"],
        "actor": "User / Verification Client",
        "action": "DOCUMENT_INGESTED",
        "object": doc_record["title"],
        "details": f"Processed {len(claims)} structured claims. Fingerprint: {doc_record['hashSha256'][:16]}...",
        "txHash": None,
        "blockNumber": None
    })

    return {"document": doc_record, "claims": claims}

@router.post("/{doc_id}/anchor")
def anchor_document(doc_id: str):
    doc = next((d for d in db.documents if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    anchor_info = anchor_to_ledger(doc["hashSha256"], item_type="DOCUMENT")
    doc["isAnchored"] = True
    doc["status"] = "ANCHORED"
    doc["blockchainTx"] = anchor_info["txHash"]

    # Also anchor any unanchored claims belonging to this document
    for c in db.claims:
        if c["sourceDocumentId"] == doc_id and not c["blockchainAnchor"]["isAnchored"]:
            c["blockchainAnchor"] = anchor_info

    # Log audit event
    db.audit_trail.insert(0, {
        "id": f"aud-{len(db.audit_trail) + 1}",
        "timestamp": anchor_info["timestamp"],
        "actor": "VERITAS Smart Contract Gateway",
        "action": "DOCUMENT_FINGERPRINT_ANCHORED",
        "object": f"DocumentRegistry.sol - {doc['title']}",
        "details": f"Simulated demo anchor for SHA-256 fingerprint {doc['hashSha256']}. No document contents are included.",
        "txHash": anchor_info["txHash"],
        "blockNumber": anchor_info["blockNumber"]
    })

    return {"document": doc, "anchor": anchor_info}
