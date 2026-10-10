import { Document, Claim, Contradiction, Issuer, AuditEvent, PublicVerificationPackage, EvidenceGraphData, BlockchainAnchor, AnalyticsData, SourceCheck, AdvisorReport } from './types';
import { INITIAL_DOCUMENTS, INITIAL_CLAIMS, INITIAL_CONTRADICTIONS, INITIAL_ISSUERS } from './mockData';

// Use same-origin requests in the browser. Next.js proxies /api locally and
// Vercel routes /api to the backend service in production.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const SESSION_DOCUMENT_PREFIX = 'veritas:demo-document:';

function readSessionDocument(id: string): { document: Document; claims: Claim[] } | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.sessionStorage.getItem(`${SESSION_DOCUMENT_PREFIX}${id}`);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function saveSessionDocument(value: { document: Document; claims: Claim[] }) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${SESSION_DOCUMENT_PREFIX}${value.document.id}`, JSON.stringify(value));
  } catch {
    // The API result still renders on the completion screen if browser storage is unavailable.
  }
}

function readSessionClaim(id: string): { document: Document; claims: Claim[]; claim: Claim } | null {
  if (typeof window === 'undefined') return null;
  try {
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (!key?.startsWith(SESSION_DOCUMENT_PREFIX)) continue;
      const stored = window.sessionStorage.getItem(key);
      if (!stored) continue;
      const value = JSON.parse(stored) as { document: Document; claims: Claim[] };
      const claim = value.claims.find(item => item.id === id);
      if (claim) return { ...value, claim };
    }
  } catch {
    return null;
  }
  return null;
}

function demoAnchor(seed: string): BlockchainAnchor {
  const compact = seed.replace(/[^0-9a-f]/gi, '').padEnd(64, '0').slice(0, 64);
  return {
    isAnchored: true,
    network: 'VERITAS Demo Network (Browser Session)',
    txHash: `0x${compact}`,
    blockNumber: 18472921,
    timestamp: new Date().toISOString(),
    status: 'IMMUTABLE ANCHOR',
    gasUsed: 0,
    contractAddress: null,
  };
}

async function safeFetch<T>(endpoint: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(typeof errorBody?.detail === 'string' ? errorBody.detail : `API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (fallback !== undefined) {
      console.warn(`Safe fetch fallback for ${endpoint}:`, err);
      return fallback;
    }
    throw err;
  }
}

export const api = {
  isSessionDocument(id: string): boolean {
    return Boolean(readSessionDocument(id));
  },
  async latestAdvisor(id: string): Promise<AdvisorReport | null> {
    return safeFetch<AdvisorReport | null>(`/api/documents/${id}/advisor/latest`);
  },
  async generateAdvisor(id: string, lang = 'en', termLookup = false): Promise<{reportId: string}> {
    return safeFetch(`/api/documents/${id}/advisor`, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({lang, termLookup})});
  },
  async correctionRequest(reportId: string, suggestionIds: string[]): Promise<{draftText: string}> {
    return safeFetch(`/api/advisor/${reportId}/correction-request`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({suggestionIds})});
  },
  async askAdvisor(reportId: string, question: string): Promise<{answer:string;citations:string[]}> {
    return safeFetch(`/api/advisor/${reportId}/ask`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});
  },
  // Documents
  async getDocuments(): Promise<Document[]> {
    return safeFetch<Document[]>('/api/documents', {}, INITIAL_DOCUMENTS);
  },

  async getDocument(id: string): Promise<{ document: Document; claims: Claim[] }> {
    const sessionDocument = readSessionDocument(id);
    if (sessionDocument) return sessionDocument;
    return safeFetch<{ document: Document; claims: Claim[] }>(`/api/documents/${id}`);
  },

  async uploadDocument(formData: FormData): Promise<{ document: Document; claims: Claim[] }> {
    const result = await safeFetch<{ document: Document; claims: Claim[] }>(
      '/api/documents/upload',
      {
        method: 'POST',
        body: formData
      }
    );
    const selected = formData.get('file');
    if (selected instanceof File) {
      result.document.fileUrl = URL.createObjectURL(selected);
      result.document.fileAvailable = true;
      result.document.fileAccess = 'BROWSER_SESSION';
      result.document.mimeType = selected.type;
    }
    saveSessionDocument(result);
    return result;
  },

  async anchorDocument(id: string): Promise<{ document: Document; anchor: BlockchainAnchor }> {
    const sessionDocument = readSessionDocument(id);
    if (sessionDocument) {
      const anchor = demoAnchor(sessionDocument.document.hashSha256);
      const updated = {
        document: { ...sessionDocument.document, isAnchored: true, status: 'ANCHORED' as const, blockchainTx: anchor.txHash },
        claims: sessionDocument.claims.map(claim => ({ ...claim, blockchainAnchor: anchor })),
      };
      saveSessionDocument(updated);
      return { document: updated.document, anchor };
    }
    return safeFetch<{ document: Document; anchor: BlockchainAnchor }>(
      `/api/documents/${id}/anchor`,
      { method: 'POST' }
    );
  },

  // Claims
  async getClaims(params?: { document_id?: string; status?: string; has_conflict?: boolean; query?: string }): Promise<Claim[]> {
    let queryStr = '';
    if (params) {
      const q = new URLSearchParams();
      if (params.document_id) q.set('document_id', params.document_id);
      if (params.status) q.set('status', params.status);
      if (params.has_conflict !== undefined) q.set('has_conflict', String(params.has_conflict));
      if (params.query) q.set('query', params.query);
      queryStr = `?${q.toString()}`;
    }
    return safeFetch<Claim[]>(`/api/claims${queryStr}`, {}, INITIAL_CLAIMS);
  },

  async getClaim(id: string): Promise<{ claim: Claim; document: Document; relatedClaims: Claim[]; conflict?: Contradiction | null }> {
    const sessionClaim = readSessionClaim(id);
    if (sessionClaim) {
      return {
        claim: sessionClaim.claim,
        document: sessionClaim.document,
        relatedClaims: sessionClaim.claims.filter(item => item.id !== id),
        conflict: null,
      };
    }
    return safeFetch<{ claim: Claim; document: Document; relatedClaims: Claim[]; conflict?: Contradiction | null }>(`/api/claims/${id}`);
  },

  async getSourceCheck(id: string): Promise<SourceCheck> {
    const sourceClaimId = readSessionClaim(id) ? 'claim-1' : id;
    return safeFetch(`/api/source-checks/${encodeURIComponent(sourceClaimId)}`);
  },

  async runSourceCheck(id: string): Promise<SourceCheck> {
    const sourceClaimId = readSessionClaim(id) ? 'claim-1' : id;
    return safeFetch(`/api/source-checks/${encodeURIComponent(sourceClaimId)}/run`, { method: 'POST' });
  },

  async anchorClaim(id: string): Promise<{ claim: Claim; anchor: BlockchainAnchor }> {
    const sessionClaim = readSessionClaim(id);
    if (sessionClaim) {
      const anchor = demoAnchor(sessionClaim.document.hashSha256 + id);
      const updatedClaim = { ...sessionClaim.claim, blockchainAnchor: anchor };
      saveSessionDocument({
        document: sessionClaim.document,
        claims: sessionClaim.claims.map(claim => claim.id === id ? updatedClaim : claim),
      });
      return { claim: updatedClaim, anchor };
    }
    return safeFetch<{ claim: Claim; anchor: BlockchainAnchor }>(
      `/api/claims/${id}/anchor`,
      { method: 'POST' }
    );
  },

  async attestClaim(id: string): Promise<{ claim: Claim; status: string }> {
    return safeFetch<{ claim: Claim; status: string }>(
      `/api/claims/${id}/attest`,
      { method: 'POST' }
    );
  },

  async revokeClaim(id: string): Promise<{ claim: Claim; status: string }> {
    return safeFetch<{ claim: Claim; status: string }>(
      `/api/claims/${id}/revoke`,
      { method: 'POST' }
    );
  },

  // Contradictions
  async getContradictions(): Promise<Contradiction[]> {
    return safeFetch<Contradiction[]>('/api/contradictions', {}, INITIAL_CONTRADICTIONS);
  },

  async reviewContradiction(id: string, action: string, notes?: string): Promise<Contradiction> {
    return safeFetch<Contradiction>(
      `/api/contradictions/${id}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      }
    );
  },

  // Public Verification
  async verifyClaimPublic(claimId: string): Promise<PublicVerificationPackage> {
    const sessionClaim = readSessionClaim(claimId);
    const claim = sessionClaim?.claim || INITIAL_CLAIMS.find(c => c.id === claimId) || INITIAL_CLAIMS[0];
    const doc = sessionClaim?.document || INITIAL_DOCUMENTS.find(d => d.id === claim.sourceDocumentId) || INITIAL_DOCUMENTS[0];
    const issuer = INITIAL_ISSUERS.find(i => i.id === claim.issuerId) || INITIAL_ISSUERS[0];

    const fallback: PublicVerificationPackage = {
      isVerified: false,
      claim: {
        id: claim.id,
        subject: claim.subject,
        predicate: claim.predicate,
        object: claim.object,
        confidence: claim.confidence,
        confidenceTier: claim.confidenceTier,
        claimHash: '0x8a2f1c4e90d182b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b',
        verificationStatus: claim.verificationStatus
      },
      evidence: {
        documentTitle: doc.title,
        documentHash: doc.hashSha256,
        pageNumber: claim.sourcePage,
        evidenceRegion: claim.evidenceRegion,
        snippetText: claim.rawSnippet,
        availability: doc.fileAccess || 'NOT_RETAINED',
        originalAvailable: Boolean(doc.fileAvailable && claim.evidenceMappingStatus !== 'UNAVAILABLE'),
        conflictEvidenceUnavailable: Boolean(claim.hasConflict && (!doc.fileAvailable || claim.evidenceMappingStatus === 'UNAVAILABLE')),
        privacyNotice: doc.fileAvailable ? 'The full source stays restricted to the current browser session; public verification shows only the selected evidence.' : 'Original evidence is unavailable. No fabricated source is substituted.'
      },
      issuer: {
        name: issuer.name,
        jurisdiction: issuer.jurisdiction,
        address: issuer.address,
        isVerified: issuer.status === 'VERIFIED',
        registryStatus: issuer.status,
        statusReason: issuer.statusReason || undefined,
        statusChangedAt: issuer.statusChangedAt || undefined
      },
      integrity: {
        documentHashValid: false,
        claimCommitmentValid: false,
        tamperEvidentStatus: 'DEMO_NOT_INDEPENDENTLY_VERIFIED'
      },
      blockchain: claim.blockchainAnchor,
      crossDocumentConsistency: {
        isConsistent: !claim.hasConflict,
        contradictionCount: claim.hasConflict ? 1 : 0,
        status: claim.hasConflict ? 'CONTRADICTION_FLAGGED' : 'CONSISTENT'
      },
      timestamp: new Date().toISOString()
    };

    if (sessionClaim) return fallback;
    return safeFetch<PublicVerificationPackage>(`/api/verify/${claimId}`, {}, fallback);
  },

  // Graph
  async getEvidenceGraph(): Promise<EvidenceGraphData> {
    return safeFetch<EvidenceGraphData>('/api/graph', {}, { nodes: [], edges: [] });
  },

  // Issuers
  async getIssuers(): Promise<Issuer[]> {
    return safeFetch<Issuer[]>('/api/issuers', {}, INITIAL_ISSUERS);
  },

  async registerIssuer(data: { name: string; jurisdiction: string; address: string; publicKeyUri?: string }): Promise<Issuer> {
    return safeFetch<Issuer>('/api/issuers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async transitionIssuer(id: string, action: 'VERIFY' | 'SUSPEND' | 'REINSTATE' | 'REVOKE', reason: string): Promise<Issuer> {
    return safeFetch<Issuer>(`/api/issuers/${id}/transition`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, reason }) });
  },

  // Audit
  async getAuditTrail(): Promise<AuditEvent[]> {
    return safeFetch<AuditEvent[]>('/api/audit', {}, []);
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return safeFetch<AnalyticsData>('/api/analytics', {}, {
      kpis: {
        documentsProcessed: 1284,
        claimsExtracted: 8421,
        claimsWithConflicts: 37,
        pendingVerification: 126,
        documentIntegrityHealth: 98.7,
        verificationActivityGrowth: 18.4,
        issuerVerificationRate: 94.2
      },
      activityTimeline: [],
      claimsByPredicate: [],
      issuerDistribution: []
    });
  },

  // Reset Demo
  async resetDemo(): Promise<void> {
    await safeFetch('/api/reset-demo', { method: 'POST' });
  }
};
