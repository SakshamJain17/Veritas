import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routes import documents, claims, contradictions, issuers, verify, audit, analytics, graph, source_checks, advisor
from app.data import db

app = FastAPI(
    title="VERITAS API - Proof of Reality",
    description="Backend API for AI-powered document provenance and evidence-backed claim verification infrastructure.",
    version="1.0.0"
)

@app.middleware("http")
async def public_demo_guard(request: Request, call_next):
    # The public deployment has no authentication or durable storage. Keep it
    # read-only except for advisor generation on seeded, synthetic documents.
    if os.getenv("VERCEL") == "1" and request.method not in {"GET", "HEAD", "OPTIONS"}:
        path = request.url.path
        seeded_advisor = request.method == "POST" and path in {
            f"/api/documents/doc-{i}/advisor" for i in range(1, 6)
        }
        if not seeded_advisor:
            return JSONResponse(status_code=403, content={"detail": "This public demo is read-only. Run VERITAS locally to analyze your own documents."})
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3010", "http://127.0.0.1:3010"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(claims.router)
app.include_router(contradictions.router)
app.include_router(issuers.router)
app.include_router(verify.router)
app.include_router(audit.router)
app.include_router(analytics.router)
app.include_router(graph.router)
app.include_router(source_checks.router)
app.include_router(advisor.router)

@app.get("/")
def root():
    return {
        "platform": "VERITAS",
        "tagline": "Don't trust the document. Verify the claim.",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "networkMode": db.network_mode
    }

@app.post("/api/reset-demo")
def reset_demo():
    db.reset()
    source_checks.clear_source_checks()
    return {"message": "VERITAS demo data restored to pristine initial state"}

@app.post("/api/network/toggle")
def toggle_network(mode: str = "demo"):
    db.network_mode = mode
    return {"networkMode": db.network_mode}
