"""Private advisor routes; intentionally absent from public verification routes."""
import json
import os
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from app.data import db
from app.services.advisor import BADGE, DISCLAIMER, GLOSSARY_RECORDS, PROMPT_VERSION, build_rule_report, glossary_search, input_digest
from app.services.advisor_lookup import lookup_missing_terms

router = APIRouter(tags=["advisor"])

class GenerateRequest(BaseModel):
    lang: str = "en"
    termLookup: bool = False

class CorrectionRequest(BaseModel):
    suggestionIds: list[str] = Field(min_length=1)

class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)

def _document(doc_id):
    doc = next((d for d in db.documents if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(404, "Document not found")
    if not doc.get("advisorConsent"):
        raise HTTPException(403, "AI expert review requires upload consent")
    return doc

def _report(report_id):
    report = next((r for r in db.advisor_reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(404, "Advisor report not found")
    _document(report["documentId"])
    return report

@router.get("/api/glossary")
def search_glossary(q: str = ""):
    return glossary_search(q)

@router.post("/api/documents/{doc_id}/advisor", status_code=status.HTTP_202_ACCEPTED)
def generate_advisor(doc_id: str, body: GenerateRequest):
    doc = _document(doc_id)
    if body.lang not in {"en", "hi"}:
        raise HTTPException(422, "Supported languages: en, hi")
    claims = [c for c in db.claims if c["sourceDocumentId"] == doc_id]
    digest = input_digest(doc, claims, db.contradictions, body.lang + (":lookup" if body.termLookup else ":local"))
    cached = next((r for r in reversed(db.advisor_reports) if r["documentId"] == doc_id and r["inputDigest"] == digest), None)
    if cached:
        return {"reportId": cached["id"], "cached": True}
    report_json = build_rule_report(doc, claims, db.claims, db.contradictions, body.lang)
    # Demo mode is deterministic. Live drafting requires a configured model integration;
    # until one is available, the safe rule-based report is returned explicitly.
    mode = os.getenv("ADVISOR", "demo").lower()
    if mode == "live":
        report_json["notice"] = "AI drafting unavailable — rule-based summary shown."
    else:
        report_json["mode"] = "DEMO"
    if body.termLookup:
        text = " ".join(c.get("rawSnippet", "") for c in claims)
        lookups = lookup_missing_terms(text, GLOSSARY_RECORDS)
        for source in lookups:
            report_json["terms"].append({"term": source["term"], "aliasesMatched": [source["term"]], "plainMeaning": source["excerpt"], "whyItMattersHere": "This term appears in extracted text; confirm its context on the source page.", "sourceType": "official", "sourceRef": source["id"], "sourceUrl": source["url"], "retrievedAt": source["retrievedAt"], "appearsIn": [], "variesByState": True, "reviewedBy": None})
        if not lookups:
            report_json["termLookup"] = "No official source excerpt was available; glossary entries are shown."
    report = {"id": str(uuid4()), "documentId": doc_id, "version": 1 + sum(r["documentId"] == doc_id for r in db.advisor_reports), "lang": body.lang, "status": "complete", "inputDigest": digest, "modelId": None, "promptVersion": PROMPT_VERSION, "reportJson": report_json, "createdAt": datetime.now(timezone.utc).isoformat(), "createdBy": "private-user"}
    db.advisor_reports.append(report)
    return {"reportId": report["id"], "cached": False}

@router.get("/api/documents/{doc_id}/advisor/latest")
def latest_advisor(doc_id: str):
    _document(doc_id)
    return next((r for r in reversed(db.advisor_reports) if r["documentId"] == doc_id), None)

@router.get("/api/advisor/{report_id}/stream")
def stream_advisor(report_id: str):
    report = _report(report_id)
    def events():
        for stage in ["collecting claims", "glossary", "drafting", "validating"]:
            yield f"event: progress\ndata: {json.dumps({'stage': stage})}\n\n"
        yield f"event: complete\ndata: {json.dumps({'reportId': report['id']})}\n\n"
    return StreamingResponse(events(), media_type="text/event-stream")

@router.post("/api/advisor/{report_id}/correction-request")
def correction_request(report_id: str, body: CorrectionRequest):
    report = _report(report_id)
    doc = _document(report["documentId"])
    selected = [s for s in report["reportJson"]["suggestions"] if s["id"] in set(body.suggestionIds) and s["actor"] in {"issuing_authority", "reviewer_and_issuing_authority"}]
    if not selected:
        raise HTTPException(422, "Select an issuing-office suggestion")
    lines = [f"To: {doc['issuerName']}", f"Subject: Request for clarification — {doc['title']}", "", "Dear Sir or Madam,", "", f"I am reviewing {doc['title']} and would appreciate clarification on the following points:", ""]
    for i, s in enumerate(selected, 1):
        lines.append(f"{i}. {s['title']}: {s['suggestedWording']}")
        for e in s["evidence"]:
            lines.append(f"   Reference: page {e['page']}, extracted passage: “{e['quote']}”")
    lines += ["", "Please advise whether an official clarification or reissued record is appropriate. I have not changed the original document.", "", "Sincerely,", "[Your name]", "", DISCLAIMER, BADGE]
    result = {"id": str(uuid4()), "reportId": report_id, "suggestionIds": [s["id"] for s in selected], "draftText": "\n".join(lines), "createdAt": datetime.now(timezone.utc).isoformat()}
    db.correction_requests.append(result)
    return result

@router.post("/api/advisor/{report_id}/ask")
def ask_advisor(report_id: str, body: AskRequest):
    report = _report(report_id)
    question = body.question.casefold()
    if any(word in question for word in ["court", "win", "safe to buy", "legal advice", "ownership", "authentic"]):
        answer = "I cannot predict an outcome or decide ownership. Consult a qualified professional for decisions."
        citations = []
    else:
        findings = report["reportJson"]["conclusion"]["keyFindings"]
        answer = "The extracted claims and source pages are listed in this review. Please check the cited page against the original record."
        citations = [f["claimId"] for f in findings[:3]]
    return {"answer": answer, "citations": citations, "disclaimer": DISCLAIMER, "badge": BADGE}
