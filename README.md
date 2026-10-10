# VERITAS — "Proof of Reality"
> **"Don't trust the document. Verify the claim."**
> Evidence-Backed AI Document Provenance and Cryptographic Claim Verification Infrastructure.

## Hosted demo

[Open VERITAS](https://veritas-alpha-ecru.vercel.app). The frontend and API are deployed together on Vercel. Vercel login is currently required; public access is pending project-owner approval to disable deployment protection.

The hosted deployment uses seeded demo records. Upload and state-changing API operations are disabled there. To run the full interactive prototype locally, follow the setup instructions below.

## Prototype Scope

- Extraction is deterministic demo logic based on document type/title; this prototype does not run OCR or an AI model.
- Uploaded bytes are hashed in memory by the API and discarded. No document vault, encryption, or file retention is implemented.
- The public verifier discloses a selected evidence snippet and claim metadata, but not the full document. This is selective disclosure, not a zero-knowledge proof.
- The API stores demo state in process memory. Restarting it resets changes; the reset endpoint restores the seeded records.
- Demo network anchors are simulated. The Solidity contracts are source artifacts and are not deployed by the app; there is no live testnet or wallet integration.
- The dashboard's large totals are illustrative seeded metrics, not counts calculated from the five demo documents.
- Optional TinyFish Fetch checks observe an approved public land-record dashboard. They provide jurisdiction context only and do not authenticate the demo claim, issuer, or document. The API key stays on the backend.

---

## 🏛️ Executive Summary

Public records (land records, certificates, municipal licenses, tax receipts, permits) frequently exist as messy scanned PDFs, smartphone photographs, handwritten entries, and regional-language documents. 

Simply digitizing these documents does not establish:
1. What the document actually claims.
2. Where a particular claim originated in the underlying document.
3. Whether the record has been modified or forged.
4. Whether multiple records contradict one another.
5. Whether an independent third party can verify a single claim without full document exposure.

**VERITAS** solves this by converting messy documents into structured, evidence-backed claims and anchoring their cryptographic provenance in a tamper-evident blockchain layer.

```
       ┌────────────────────────┐
       │   Messy Public Record  │ (Scanned PDF, Handwritten, Photo)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ AI Understands Record  │ (OCR + Visual Token Extraction)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ VERITAS Structures     │ (Subject-Predicate-Object Triples)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Physical Evidence Link │ (Exact Bounding Box Coordinates)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Blockchain Provenance  │ (Document & Claim Hashes Anchored)
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Third-Party Verifier   │ (Selected Evidence Disclosure)
       └────────────────────────┘
```

---

## ⚡ The Core Philosophy

| Traditional Systems | Generic AI Chatbots | **VERITAS Architecture** |
| :--- | :--- | :--- |
| Document $\rightarrow$ Trust Document | Document $\rightarrow$ AI $\rightarrow$ Trust AI | Document $\rightarrow$ Bounded Claim $\rightarrow$ Evidence $\rightarrow$ Issuer Attestation $\rightarrow$ Blockchain Anchor $\rightarrow$ Independent Verification |
| Forgeries go undetected | Hallucinations & opaque summaries | Every demo claim links to evidence bounds and a simulated commitment |
| Full document leaked | Full document sent to LLM | **Raw documents stay off-chain**; a selected evidence snippet may be shared |

> ⚠️ **Important UX Principle:** VERITAS strictly separates **AI Extraction Confidence** from **Cryptographic Integrity**. They are distinct signals and are never blended into a fake "AI authenticity score".

---

## 🚀 Live Demo Scenario (Judging Flow)

VERITAS includes a preloaded demo dataset and preconfigured preset flows:

1. **Dashboard (`/dashboard`)**:
   - Inspect overall metrics: 1,284 documents processed, 8,421 claims extracted, 98.7% document integrity.
   - Observe recent verifications and active contradiction alerts.
2. **Ingest Public Record (`/upload`)**:
   - Click preset **"Scenario A: Land Ownership Certificate #LC-1842"**.
   - Watch the animated **10-Step AI Processing Pipeline** (Ingestion $\rightarrow$ OCR $\rightarrow$ Structure $\rightarrow$ Entity $\rightarrow$ Claims $\rightarrow$ Evidence Bounds $\rightarrow$ Cross-Doc Consistency $\rightarrow$ SHA-256 Fingerprint).
3. **Split-Screen Evidence Viewer (`/documents/doc-1`)**:
   - High-fidelity interactive document canvas with official seals and title deeds.
   - Click **`Owner = Rahul Sharma`**: the exact bounding region in Schedule II on Page 2 illuminates with animated cyan bounds!
   - Click **"Anchor on Blockchain"** to anchor the SHA-256 fingerprint to `DocumentRegistry.sol`.
4. **Contradiction Detection (`/upload` Preset B)**:
   - Ingest **"Disputed Mutation Extract #MR-2021-99"**.
   - VERITAS detects that Survey Parcel 184/2 lists `Owner = Rohan Sharma` contradicting `Rahul Sharma`!
   - Displays the **⚠ Contradiction Detected** banner with human-in-the-loop review controls (*AI extraction $\neq$ legal truth*).
5. **Interactive Evidence Graph (`/evidence`)**:
   - Inspect the multi-tier graph topology linking **Issuer $\rightarrow$ Document $\rightarrow$ Claim $\rightarrow$ Evidence Region $\rightarrow$ Blockchain Anchor**.
   - Click any node to open the metadata inspection drawer.
6. **QR Code & Third-Party Public Verification (`/verify/claim-1`)**:
   - Click **"Generate Verification QR"** or open `/verify/claim-1`.
   - Independent verifiers inspect the claim on mobile or desktop **without logging in and without a wallet**.
   - Shows the selected evidence snippet, issuer metadata, and simulated anchor status without exposing the complete document.
7. **Audit Trail (`/audit`)**:
   - Review the demo timeline of timestamps, actors, actions, and simulated transaction hashes.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS, Lucide Icons, Recharts, `qrcode.react`.
- **Backend API**: Python 3.12, FastAPI, Pydantic v2, Uvicorn.
- **Smart Contracts (EVM)**: Solidity 0.8.20
  - `DocumentRegistry.sol`
  - `ClaimRegistry.sol`
  - `IssuerRegistry.sol`
  - `VerificationRegistry.sol`
- **Execution Mode**: Demo Network by default. SHA-256 hashes are real; transaction hashes, blocks, and gas values are simulated. No live testnet or wallet integration is implemented.

---

## 💻 Quick Start & Running Locally

### Optional TinyFish live observation

Set `TINYFISH_API_KEY` in the backend environment, then open a land claim page and select **Run live TinyFish check**. The server observes the fixed public dashboard configured in `backend/app/services/tinyfish.py`; claim holder names and uploaded files are not sent. Without a key, the result is `NOT_CONFIGURED`. Inaccessible pages report `UNAVAILABLE`. Observations are held in process memory and cleared with demo data.

The endpoints are `GET /api/source-checks/{claim_id}` and `POST /api/source-checks/{claim_id}/run`.

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Backend Setup (FastAPI)
```powershell
# Navigate to backend
cd backend

# Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
# source .venv/bin/activate       # Linux/macOS

# Install backend dependencies
pip install -r requirements.txt

# Optional in PowerShell: enable live TinyFish observations
$env:TINYFISH_API_KEY="your-key"

# Run the API server
python -m uvicorn app.main:app --reload --port 8000
```
*Backend API available at: `http://localhost:8000` (Swagger docs at `/docs`)*

### 3. Frontend Setup (Next.js)
```powershell
# Open a new terminal and navigate to frontend
cd frontend

# Run development server
npm run dev
```
*Frontend web application available at: `http://localhost:3000`*

See [API.md](API.md) for endpoint details, [ARCHITECTURE.md](ARCHITECTURE.md) for the system overview, [backend/schema.sql](backend/schema.sql) for the reference PostgreSQL schema, and [contracts/README.md](contracts/README.md) for the contract scope.

### 4. Running the Seed Verification Script
```powershell
cd backend
python seed_demo.py
```

---

## 🔒 Demo Privacy Behavior

For this local prototype, raw upload bytes are hashed in memory and not persisted. The public verification endpoint returns the selected snippet and claim metadata. No encryption, private object storage, or zero-knowledge proof is implemented.

| Demo API memory | Simulated demo ledger |
| :--- | :--- |
| Structured record metadata and selected evidence snippets | SHA-256 document fingerprint |
| Uploaded file bytes (discarded after hashing) | Claim commitment and issuer metadata |
| No retained source document | Simulated timestamp and block number |

---

## 📜 Smart Contract Architecture

- **`DocumentRegistry.sol`**: Anchors document SHA-256 hashes, issuing authority addresses, and revocation status.
- **`ClaimRegistry.sol`**: Anchors atomic claim commitments, linking each claim to its parent document hash and evidence bounding region.
- **`IssuerRegistry.sol`**: Manages certified government bodies and institutional public keys.
- **`VerificationRegistry.sol`**: Append-only log recording third-party verification queries and proofs.

---

## 👥 Hackathon Lead & Positioning

**VERITAS: Proof of Reality**
- AI understands the evidence.
- VERITAS structures the claims.
- Blockchain preserves provenance.
- Anyone can independently verify.

## Private Expert Review

Uploaded documents can opt into Expert Review with the checkbox on `/upload`. The report uses extracted claims and local glossary/checklist rules to explain terms, show grounded suggestions, and suggest next steps. It is separate from claim commitments, QR codes, and public verification. Open `/documents/<id>/advisor` to generate a report; seeded demo documents have consent enabled for demonstration. This prototype stores reports in memory, so a server restart clears them. The reference SQL schema includes tables for a future persistent deployment.

`ADVISOR=demo` (default) produces a deterministic rule-based report. `ADVISOR=live` currently uses the same rule-based fallback and labels it; no language-model provider is configured. Optional TinyFish term lookups require `TINYFISH_API_KEY` and `ADVISOR_ALLOWED_DOMAINS` (comma-separated official hostnames, default `indiacode.nic.in`). If source lookup fails, the glossary remains available. The in-memory prototype has no user authentication or role-based access control; deploy behind authentication before handling private real-world documents.
