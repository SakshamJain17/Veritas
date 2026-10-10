# VERITAS API

Base URL: `http://localhost:8000`. Interactive OpenAPI docs are available at `/docs` while the API is running.

The prototype API keeps state in process memory. Restarting the server restores the seed data. Upload bytes are read for SHA-256 calculation and discarded; extraction and ledger operations are simulated.

## Documents

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/documents` | List document records |
| `GET` | `/api/documents/{id}` | Get document metadata and its structured claims |
| `POST` | `/api/documents/upload` | Upload multipart fields `title`, `documentType`, `language`, `issuerId`; optional `file` (PDF, PNG, JPEG, TIFF; maximum 25 MB) |
| `POST` | `/api/documents/{id}/anchor` | Create a simulated document fingerprint anchor |

Upload response: `{ "document": Document, "claims": Claim[] }`. Document bytes are never returned or retained. If `file` is omitted for a demo preset, the document title is hashed instead.

## Claims and contradictions

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/claims` | List claims; optional `document_id`, `status`, `has_conflict`, and `query` filters |
| `GET` | `/api/claims/{id}` | Claim detail, source document, related claims, and conflict |
| `POST` | `/api/claims/{id}/source-check` | Use TinyFish to inspect a user-supplied public HTTPS URL for claim corroboration; requires backend `TINYFISH_API_KEY` |
| `POST` | `/api/claims/{id}/anchor` | Create a simulated claim anchor |
| `POST` | `/api/claims/{id}/attest` | Mark a claim reviewed and append an audit event |
| `POST` | `/api/claims/{id}/revoke` | Revoke a claim and append an audit event |
| `GET` | `/api/contradictions` | List detected conflicts |
| `POST` | `/api/contradictions/{id}/review` | Record a human review action and optional notes |

## Public verification, issuers, and operations

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/verify/{claimId}` | Public claim package with selected snippet, issuer metadata, consistency status, and demo anchor |
| `GET` | `/api/issuers` | List issuer records |
| `POST` | `/api/issuers/register` | Register an issuer record |
| `POST` | `/api/issuers/{id}/toggle-verify` | Toggle demo issuer status |
| `GET` | `/api/audit` | Read the in-memory audit trail |
| `GET` | `/api/analytics` | Return dashboard metrics and chart data |
| `GET` | `/api/graph` | Return evidence graph nodes and edges |
| `POST` | `/api/reset-demo` | Restore seeded demo records |
| `POST` | `/api/network/toggle?mode=demo` | Change the displayed network mode; does not connect to an EVM testnet |

Public verification does not expose the complete source document, but it intentionally returns the selected snippet. The demo anchors are not cryptographic attestations from a public network.
