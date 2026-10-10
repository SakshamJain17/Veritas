"""Evidence-backed extraction for user uploads.

Seeded fixtures remain in data.py. This module never chooses values from a
filename or title: every returned claim must be found in extracted source text.
"""
from __future__ import annotations

from datetime import datetime, timezone
from io import BytesIO
import re
from typing import Any, Dict, List, Tuple
from uuid import uuid4

from app.services.blockchain import compute_sha256
from app.data import db

try:
    import fitz  # PyMuPDF
except ImportError:  # pragma: no cover - tested through diagnostics
    fitz = None

try:
    from PIL import Image
    import pytesseract
except ImportError:  # pragma: no cover
    Image = None
    pytesseract = None


PATTERNS = [
    ("ownedBy", "Recorded owner", re.compile(r"(?:recorded\s+owner|owner(?:\s+name)?|titleholder|owned\s+by)\s*[:\-]\s*([^\n,;]{2,100})", re.I)),
    ("surveyNumber", "Survey number", re.compile(r"(?:survey|parcel|plot)(?:\s+(?:number|no\.?|id))?\s*[:#\-]\s*([A-Z0-9][A-Z0-9/\-]{1,40})", re.I)),
    ("registeredArea", "Area", re.compile(r"(?:registered\s+area|total\s+(?:measured\s+)?(?:extent|area)|area)\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?\s*(?:acres?|hectares?|sq\.?\s*(?:ft|m)|square\s+(?:feet|metres?)))", re.I)),
    ("registrationDate", "Registration date", re.compile(r"(?:registration\s+date|registered\s+on)\s*[:\-]\s*([^\n,;]{4,50})", re.I)),
    ("beneficiaryName", "Beneficiary", re.compile(r"(?:beneficiary|licensee|holder)(?:\s+name)?\s*[:\-]\s*([^\n,;]{2,100})", re.I)),
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _extract_pdf(raw: bytes) -> tuple[list[dict[str, Any]], int, list[str]]:
    if fitz is None:
        return [], 0, ["PyMuPDF is not installed; PDF extraction is unavailable"]
    try:
        pdf = fitz.open(stream=raw, filetype="pdf")
    except Exception as exc:
        return [], 0, [f"PDF could not be opened: {exc}"]
    if pdf.needs_pass:
        return [], len(pdf), ["Encrypted PDF requires a password"]
    pages: list[dict[str, Any]] = []
    for index, page in enumerate(pdf):
        blocks = []
        for x0, y0, x1, y1, text, *_ in page.get_text("blocks"):
            clean = " ".join(str(text).split())
            if clean:
                blocks.append({"text": clean, "bbox": [x0, y0, x1, y1]})
        pages.append({"page": index + 1, "width": page.rect.width, "height": page.rect.height, "text": "\n".join(b["text"] for b in blocks), "blocks": blocks, "method": "PDF_TEXT"})
    return pages, len(pdf), []


def _extract_image(raw: bytes) -> tuple[list[dict[str, Any]], int, list[str]]:
    if Image is None or pytesseract is None:
        return [], 1, ["Image OCR dependencies are not installed"]
    try:
        image = Image.open(BytesIO(raw)).convert("RGB")
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    except Exception as exc:
        return [], 1, [f"OCR failed: {exc}"]
    blocks = []
    for i, token in enumerate(data.get("text", [])):
        token = token.strip()
        if not token:
            continue
        x, y, w, h = (data[k][i] for k in ("left", "top", "width", "height"))
        blocks.append({"text": token, "bbox": [x, y, x + w, y + h]})
    return [{"page": 1, "width": image.width, "height": image.height, "text": " ".join(b["text"] for b in blocks), "blocks": blocks, "method": "OCR_TESSERACT"}], 1, []


def _find_region(page: dict[str, Any], match_text: str) -> tuple[dict[str, float], str, str]:
    needle = match_text.lower()
    for block in page["blocks"]:
        if needle in block["text"].lower() or any(part in block["text"].lower() for part in needle.split() if len(part) > 4):
            x0, y0, x1, y1 = block["bbox"]
            return ({"page": page["page"], "x": round(100*x0/page["width"], 2), "y": round(100*y0/page["height"], 2), "width": round(100*(x1-x0)/page["width"], 2), "height": round(100*(y1-y0)/page["height"], 2)}, block["text"], "MAPPED")
    return ({"page": page["page"], "x": 0, "y": 0, "width": 0, "height": 0}, match_text, "UNAVAILABLE")


def process_uploaded_document(title: str, doc_type: str, language: str, raw_bytes: bytes, issuer_id: str = "iss-1", mime_type: str = "application/pdf") -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    doc_id = f"doc-{uuid4().hex[:12]}"
    issuer = next((i for i in db.issuers if i["id"] == issuer_id), db.issuers[0])
    now = _now()
    pages, page_count, failures = _extract_pdf(raw_bytes) if mime_type == "application/pdf" else _extract_image(raw_bytes)
    claims: List[Dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    subject_hint = None
    for page in pages:
        for predicate, field_name, pattern in PATTERNS:
            for match in pattern.finditer(page["text"]):
                value = " ".join(match.group(1).strip().split()).rstrip(".")
                key = (predicate, value.casefold())
                if key in seen: continue
                seen.add(key)
                region, snippet, mapping = _find_region(page, match.group(0))
                if predicate == "surveyNumber": subject_hint = f"Land Parcel {value}"
                claims.append({
                    "id": f"claim-{uuid4().hex[:12]}", "subject": subject_hint or title,
                    "predicate": predicate, "fieldName": field_name, "object": value,
                    "normalizedValue": value.casefold(), "confidence": 0.95 if page["method"] == "PDF_TEXT" else 0.75,
                    "confidenceTier": "HIGH" if page["method"] == "PDF_TEXT" else "MEDIUM",
                    "sourceDocumentId": doc_id, "sourceDocumentName": title, "sourcePage": page["page"],
                    "evidenceRegion": region, "rawSnippet": snippet, "evidenceMappingStatus": mapping,
                    "extractionMethod": page["method"], "reviewStatus": "PENDING" if mapping != "MAPPED" else "NOT_REQUIRED",
                    "issuerId": issuer["id"], "issuerName": issuer["name"], "issuerVerified": issuer.get("status") == "VERIFIED",
                    "createdAt": now, "integrityStatus": "UNVERIFIED", "verificationStatus": "PENDING_REVIEW",
                    "blockchainAnchor": {"isAnchored": False, "network": "VERITAS Demo Network (EVM Simulated)", "txHash": None, "blockNumber": None, "timestamp": None, "status": "UNANCHORED", "gasUsed": None, "contractAddress": None},
                    "hasConflict": False, "conflictId": None,
                })
    text_pages = sum(bool(page["text"].strip()) for page in pages)
    ocr_pages = sum(page["method"].startswith("OCR") for page in pages)
    total_text = sum(len(page["text"]) for page in pages)
    if not pages or total_text == 0:
        failures.append("No usable text was extracted")
    summary = {"pageCount": page_count, "textExtractedPages": text_pages - ocr_pages, "ocrPages": ocr_pages, "sourceTextLength": total_text, "claimsExtracted": len(claims), "claimsMapped": sum(c["evidenceMappingStatus"] == "MAPPED" for c in claims), "ambiguousFields": sum(c["reviewStatus"] == "PENDING" for c in claims), "failures": failures}
    status = "EXTRACTED" if claims else ("PARTIAL" if total_text else "EXTRACTION_FAILED")
    document = {"id": doc_id, "title": title, "documentType": doc_type, "language": language, "pageCount": page_count, "fileSizeKb": max(1, len(raw_bytes)//1024), "hashSha256": compute_sha256(raw_bytes), "uploadedAt": now, "status": status, "claimsCount": len(claims), "issuerId": issuer["id"], "issuerName": issuer["name"], "issuerAddress": issuer["address"], "issuerStatus": issuer.get("status", "PENDING_VERIFICATION"), "isAnchored": False, "blockchainTx": None, "thumbnailUrl": None, "previewPages": [f"Page {p['page']}: {p['text'][:100]}" for p in pages], "mimeType": mime_type, "fileAvailable": False, "fileAccess": "NOT_RETAINED", "fileUrl": None, "extractionSummary": summary}
    return document, claims
