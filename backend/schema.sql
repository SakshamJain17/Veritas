-- Reference PostgreSQL schema for a future persistent deployment.
-- The hackathon API currently uses in-memory Python data and does not execute this file.

CREATE TABLE issuers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  address TEXT NOT NULL,
  public_key_uri TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  language TEXT NOT NULL,
  sha256 BYTEA NOT NULL CHECK (octet_length(sha256) = 32),
  issuer_id TEXT REFERENCES issuers(id),
  page_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  storage_ref TEXT -- private object-storage reference; never a public-chain document URI
);

CREATE TABLE claims (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  predicate TEXT NOT NULL,
  object_value TEXT NOT NULL,
  confidence REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  verification_status TEXT NOT NULL,
  source_document_id TEXT NOT NULL REFERENCES documents(id),
  source_page INTEGER NOT NULL,
  evidence_region JSONB NOT NULL,
  evidence_snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE anchors (
  id BIGSERIAL PRIMARY KEY,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('document', 'claim')),
  subject_id TEXT NOT NULL,
  commitment BYTEA NOT NULL CHECK (octet_length(commitment) = 32),
  network TEXT NOT NULL,
  transaction_hash TEXT,
  block_number BIGINT,
  anchored_at TIMESTAMPTZ,
  UNIQUE (subject_type, subject_id, network)
);

CREATE TABLE audit_events (
  id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  object_ref TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  transaction_hash TEXT
);

CREATE INDEX claims_subject_predicate_idx ON claims (subject, predicate);
CREATE INDEX claims_source_document_idx ON claims (source_document_id);
CREATE INDEX audit_events_occurred_at_idx ON audit_events (occurred_at DESC);

-- Private Expert Review data. These tables are never read by public verification.
ALTER TABLE documents ADD COLUMN advisor_consent BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE glossary_terms (id TEXT PRIMARY KEY, term TEXT NOT NULL, aliases JSONB NOT NULL DEFAULT '[]', language TEXT NOT NULL DEFAULT 'en', definition TEXT NOT NULL, varies_by_state BOOLEAN NOT NULL DEFAULT FALSE, related_terms JSONB NOT NULL DEFAULT '[]', reviewed_by TEXT, reviewed_at TIMESTAMPTZ);
CREATE TABLE advisor_reports (id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id), version INTEGER NOT NULL, lang TEXT NOT NULL, status TEXT NOT NULL, input_digest TEXT NOT NULL, model_id TEXT, prompt_version TEXT NOT NULL, report_json JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), created_by TEXT NOT NULL, UNIQUE (document_id, version));
CREATE TABLE advisor_term_lookups (id TEXT PRIMARY KEY, report_id TEXT NOT NULL REFERENCES advisor_reports(id), term TEXT NOT NULL, source_type TEXT NOT NULL, url TEXT NOT NULL, domain TEXT NOT NULL, excerpt TEXT NOT NULL, content_digest TEXT NOT NULL, retrieved_at TIMESTAMPTZ NOT NULL, tinyfish_run_id TEXT);
CREATE TABLE correction_requests (id TEXT PRIMARY KEY, report_id TEXT NOT NULL REFERENCES advisor_reports(id), suggestion_ids JSONB NOT NULL, draft_text TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE advisor_questions (id TEXT PRIMARY KEY, report_id TEXT NOT NULL REFERENCES advisor_reports(id), question TEXT NOT NULL, answer_json JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX advisor_reports_document_idx ON advisor_reports (document_id, version DESC);
