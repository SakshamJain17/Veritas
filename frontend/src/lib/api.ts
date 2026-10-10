import { Document, Claim, Contradiction, Issuer, AuditEvent, PublicVerificationPackage, EvidenceGraphData, BlockchainAnchor, AnalyticsData, SourceCheck, AdvisorReport } from './types';
import { INITIAL_DOCUMENTS, INITIAL_CLAIMS, INITIAL_CONTRADICTIONS, INITIAL_ISSUERS } from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    const fallbackDoc = INITIAL_DOCUMENTS.find(d => d.id === id) || INITIAL_DOCUMENTS[0];
    const fallbackClaims = INITIAL_CLAIMS.filter(c => c.sourceDocumentId === fallbackDoc.id);
    return safeFetch<{ document: Document; claims: Claim[] }>(
      `/api/documents/${id}`,
      {},
      { document: fallbackDoc, claims: fallbackClaims }
    );
  },

  async uploadDocument(formData: FormData): Promise<{ document: Document; claims: Claim[] }> {
    return safeFetch<{ document: Document; claims: Claim[] }>(
      '/api/documents/upload',
      {
        method: 'POST',
        body: formData
      }
    );
  },

  async anchorDocument(id: string): Promise<{ document: Document; anchor: BlockchainAnchor }> {
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
    const fallbackClaim = INITIAL_CLAIMS.find(c => c.id === id) || INITIAL_CLAIMS[0];
    const fallbackDoc = INITIAL_DOCUMENTS.find(d => d.id === fallbackClaim.sourceDocumentId) || INITIAL_DOCUMENTS[0];
    const fallbackRelated = INITIAL_CLAIMS.filter(c => c.id !== fallbackClaim.id);
    const fallbackConflict = fallbackClaim.hasConflict ? INITIAL_CONTRADICTIONS[0] : null;

    return safeFetch<{ claim: Claim; document: Document; relatedClaims: Claim[]; conflict?: Contradiction | null }>(
      `/api/claims/${id}`,
      {},
      { claim: fallbackClaim, document: fallbackDoc, relatedClaims: fallbackRelated, conflict: fallbackConflict }
    );
  },

  async getSourceCheck(id: string): Promise<SourceCheck> {
    return safeFetch(`/api/source-checks/${encodeURIComponent(id)}`);
  },

  async runSourceCheck(id: string): Promise<SourceCheck> {
    return safeFetch(`/api/source-checks/${encodeURIComponent(id)}/run`, { method: 'POST' });
  },

  async anchorClaim(id: string): Promise<{ claim: Claim; anchor: BlockchainAnchor }> {
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
    const claim = INITIAL_CLAIMS.find(c => c.id === claimId) || INITIAL_CLAIMS[0];
    const doc = INITIAL_DOCUMENTS.find(d => d.id === claim.sourceDocumentId) || INITIAL_DOCUMENTS[0];
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
        privacyNotice: 'Demo privacy: the original upload is not retained. This page shows a selected evidence snippet and claim metadata, not the full document.'
      },
      issuer: {
        name: issuer.name,
        jurisdiction: issuer.jurisdiction,
        address: issuer.address,
        isVerified: false
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

  async toggleVerifyIssuer(id: string): Promise<Issuer> {
    return safeFetch<Issuer>(`/api/issuers/${id}/toggle-verify`, { method: 'POST' });
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
