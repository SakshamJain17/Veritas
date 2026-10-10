export interface BoundingRegion {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BlockchainAnchor {
  isAnchored: boolean;
  network: string;
  txHash: string | null;
  blockNumber: number | null;
  timestamp: string | null;
  status: 'UNANCHORED' | 'PENDING' | 'IMMUTABLE ANCHOR';
  gasUsed?: number | null;
  contractAddress?: string | null;
}

export interface Claim {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
  confidenceTier: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceDocumentId: string;
  sourceDocumentName: string;
  sourcePage: number;
  evidenceRegion: BoundingRegion;
  rawSnippet: string;
  issuerId: string;
  issuerName: string;
  issuerVerified: boolean;
  createdAt: string;
  integrityStatus: 'VERIFIED' | 'UNVERIFIED' | 'TAMPER_SUSPECT';
  verificationStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'CONFLICT' | 'REVOKED';
  blockchainAnchor: BlockchainAnchor;
  hasConflict: boolean;
  conflictId?: string | null;
  fieldName?: string;
  normalizedValue?: string;
  extractionMethod?: string;
  evidenceMappingStatus?: 'MAPPED' | 'UNAVAILABLE';
  reviewStatus?: string;
}

export interface Document {
  id: string;
  title: string;
  documentType: string;
  language: string;
  pageCount: number;
  fileSizeKb: number;
  hashSha256: string;
  uploadedAt: string;
  status: 'INGESTED' | 'EXTRACTED' | 'PARTIAL' | 'EXTRACTION_FAILED' | 'ANCHORED' | 'CONFLICT_DETECTED';
  claimsCount: number;
  issuerId: string;
  issuerName: string;
  issuerAddress: string;
  isAnchored: boolean;
  blockchainTx?: string | null;
  thumbnailUrl?: string;
  previewPages: string[];
  advisorConsent?: boolean;
  mimeType?: string | null;
  fileAvailable?: boolean;
  fileAccess?: string;
  fileUrl?: string | null;
  extractionSummary?: { pageCount: number; textExtractedPages: number; ocrPages: number; sourceTextLength: number; claimsExtracted: number; claimsMapped: number; ambiguousFields: number; failures: string[] } | null;
}

export interface ContradictionValue {
  value: string;
  docCount: number;
  docIds: string[];
  docNames: string[];
  pages: number[];
}

export interface Contradiction {
  id: string;
  field: string;
  entitySubject: string;
  valuesFound: ContradictionValue[];
  status: 'CONFLICT_DETECTED' | 'REQUIRES_HUMAN_REVIEW' | 'UNRESOLVED' | 'DISMISSED' | 'RESOLVED_AFTER_REVIEW' | 'INSUFFICIENT_EVIDENCE' | 'REQUIRES HUMAN REVIEW' | 'RESOLVED';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  detectedAt: string;
  reviewAction?: string | null;
  reviewerNotes?: string | null;
  comparisonBasis?: string;
  uncertainties?: string[];
  reviewedAt?: string | null;
  sources?: { claimId: string; documentId: string; documentTitle: string; value: string; page?: number; snippet?: string; evidenceAvailable: boolean; evidenceRegion?: BoundingRegion }[];
}

export interface Issuer {
  id: string;
  name: string;
  jurisdiction: string;
  address: string;
  publicKeyUri: string;
  isVerified: boolean;
  isRevoked: boolean;
  registeredAt: string;
  documentsIssued: number;
  claimsIssued: number;
  revocationCount: number;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED' | 'REVOKED';
  demoRecord?: boolean;
  statusChangedAt?: string | null;
  statusReason?: string | null;
  revokedAt?: string | null;
  statusHistory?: { from: string | null; to: string; action: string; reason: string; actor: string; timestamp: string }[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  object: string;
  details: string;
  txHash?: string | null;
  blockNumber?: number | null;
}

export interface PublicVerificationPackage {
  isVerified: boolean;
  claim: {
    id: string;
    subject: string;
    predicate: string;
    object: string;
    confidence: number;
    confidenceTier: string;
    claimHash: string;
    verificationStatus: string;
  };
  evidence: {
    documentTitle: string;
    documentHash: string;
    pageNumber: number;
    evidenceRegion: BoundingRegion;
    snippetText: string;
    privacyNotice: string;
    availability?: string;
    originalAvailable?: boolean;
    conflictEvidenceUnavailable?: boolean;
  };
  issuer: {
    name: string;
    jurisdiction: string;
    address: string;
    isVerified: boolean;
    registryStatus?: string;
    statusReason?: string;
    statusChangedAt?: string;
  };
  integrity: {
    documentHashValid: boolean;
    claimCommitmentValid: boolean;
    tamperEvidentStatus: string;
  };
  blockchain: BlockchainAnchor;
  crossDocumentConsistency: {
    isConsistent: boolean;
    contradictionCount: number;
    status: string;
  };
  timestamp: string;
}

export interface SourceCheck {
  status: 'NOT_RUN' | 'NOT_CONFIGURED' | 'OBSERVED' | 'SAVED_DEMO' | 'UNAVAILABLE' | 'UNSUPPORTED';
  provider?: string;
  sourceUrl?: string | null;
  finalUrl?: string;
  sourceLabel?: string | null;
  pageTitle?: string;
  scope?: string | null;
  observedAt?: string;
  excerpt?: string;
  contentSha256?: string;
  requestId?: string;
  claimMatch: 'NOT_CHECKED';
  issuerAttestation: 'NOT_CHECKED';
  message: string;
}

export interface EvidenceGraphData {
  nodes: {
    id: string;
    label: string;
    type: 'DOCUMENT' | 'CLAIM' | 'ENTITY' | 'ISSUER' | 'EVIDENCE' | 'BLOCKCHAIN RECORD';
    metadata: Record<string, string | number | boolean | null>;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label: string;
  }[];
}

export interface AnalyticsData {
  kpis: {
    documentsProcessed: number;
    claimsExtracted: number;
    claimsWithConflicts: number;
    pendingVerification: number;
    documentIntegrityHealth: number;
    verificationActivityGrowth: number;
    issuerVerificationRate: number;
  };
  activityTimeline: { date: string; documents: number; claims: number; verifications: number }[];
  claimsByPredicate: { predicate: string; count: number }[];
  issuerDistribution: { issuer: string; count: number }[];
}

export interface AdvisorEvidence { claimId: string; page: number; box?: BoundingRegion; quote: string }
export interface AdvisorTerm { term: string; aliasesMatched: string[]; plainMeaning: string; whyItMattersHere: string; sourceType: 'glossary' | 'official' | 'general'; sourceRef?: string; sourceUrl?: string; retrievedAt?: string; appearsIn: AdvisorEvidence[]; variesByState: boolean; reviewedBy?: string | null }
export interface AdvisorSuggestion { id: string; kind: string; severity: 'high' | 'medium' | 'low'; title: string; explanation: string; evidence: AdvisorEvidence[]; ruleId: string; actor: string; suggestedWording: string; confidenceNote: string; conflictId?: string }
export interface AdvisorReport { id: string; documentId: string; version: number; lang: string; status: string; reportJson: { terms: AdvisorTerm[]; suggestions: AdvisorSuggestion[]; conclusion: { appearsToBe: string; keyFindings: {claimId:string;claim:string;value:string;page:number;confidence:number;consistency:string;publicSourceCheck:string}[]; openItems:string[];nextSteps:string[];limits:string[] }; disclaimer: string; badge: string; mode?: string; notice?: string; termLookup?: string } }
