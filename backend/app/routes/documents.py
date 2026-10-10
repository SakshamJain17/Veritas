from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
import os
from typing import Optional
from app.data import db
from app.services.extractor import process_uploaded_document
from app.services.blockchain import anchor_to_ledger
from app.services.contradiction import scan_for_contradictions
from app.storage import store_upload
from pathlib import Path

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.get("")
def list_documents():
    return db.documents

@router.get("/{doc_id}")
def get_document(doc_id: str):
    doc = next((d for d in db.documents if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    issuer = next((i for i in db.issuers if i["id"] == doc.get("issuerId")), None)
    if issuer:
        doc["issuerStatus"] = issuer.get("status", "VERIFIED" if issuer.get("isVerified") else "SUSPENDED")
        doc["issuerStatusReason"] = issuer.get("statusReason")
    claims = [dict(c, issuerVerified=bool(issuer and issuer.get("status") == "VERIFIED"), issuerCurrentStatus=issuer.get("status") if issuer else "UNKNOWN") for c in db.claims if c["sourceDocumentId"] == doc_id]
    return {"document": doc, "claims": claims}

@router.get("/{doc_id}/file")
def get_document_file(doc_id: str):
    doc = next((d for d in db.documents if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    path = doc.get("storagePath")
    if not path or not Path(path).is_file():
        raise HTTPException(status_code=404, detail="Original evidence is not retained or is unavailable")
    return FileResponse(path, media_type=doc.get("mimeType") or "application/octet-stream", filename=Path(path).name)

@router.post("/upload")
async def upload_document(
    title: str = Form(...),
    documentType: str = Form("Land Record"),
    language: str = Form("English"),
    issuerId: str = Form("iss-1"),
    advisorConsent: bool = Form(False),
    file: Optional[UploadFile] = File(None)
):
    max_upload_mb = 10 if os.getenv("VERCEL") == "1" else 25
    content = await file.read(max_upload_mb * 1024 * 1024 + 1) if file else b""
    if not file or not content:
        raise HTTPException(status_code=422, detail="A non-empty document file is required")
    if len(content) > max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Document exceeds the {max_upload_mb} MB upload limit")
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
        issuer_id=issuerId,
        mime_type=file.content_type or "application/octet-stream"
    )

    stored_path = store_upload(doc_record["id"], file.filename or "upload.bin", content)
    doc_record.update({
        "storagePath": stored_path,
        "fileAvailable": bool(stored_path),
        "fileAccess": "PRIVATE_LOCAL" if stored_path else "NOT_RETAINED_SERVERLESS",
        "fileUrl": f"/api/documents/{doc_record['id']}/file" if stored_path else None,
    })

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

    db.persist()

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
            c["integrityStatus"] = "VERIFIED"
            c["verificationStatus"] = "VERIFIED"

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

    db.persist()

    return {"document": doc, "anchor": anchor_info}
