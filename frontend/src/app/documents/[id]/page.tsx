'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Lock, 
  QrCode, 
  ExternalLink, 
  ArrowLeft,
  Copy,
  Check
} from 'lucide-react';
import { api } from '@/lib/api';
import { Document, Claim, AdvisorTerm } from '@/lib/types';
import DocumentViewerCanvas from '@/components/DocumentViewerCanvas';
import ClaimBadge from '@/components/ClaimBadge';
import QRVerificationModal from '@/components/QRVerificationModal';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const docId = resolvedParams.id;
  const searchParams = useSearchParams();

  const [document, setDocument] = useState<Document | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [advisorTerms, setAdvisorTerms] = useState<AdvisorTerm[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [qrModalClaim, setQrModalClaim] = useState<Claim | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    api.latestAdvisor(docId).then(report => setAdvisorTerms(report?.reportJson.terms || [])).catch(() => {});
    api.getDocument(docId).then(data => {
      setDocument(data.document);
      setClaims(data.claims);
      const requestedClaim = searchParams.get('claim');
      const initial = data.claims.find(claim=>claim.id===requestedClaim) || data.claims[0];
      if (initial) {
        setSelectedClaimId(initial.id);
        setActivePage(Number(searchParams.get('page')) || initial.sourcePage);
      }
      setLoading(false);
    }).catch(err=>{setError(err instanceof Error?err.message:'Unable to load document');setLoading(false)});
  }, [docId, searchParams]);

  const handleSelectClaim = (claimId: string) => {
    setSelectedClaimId(claimId);
    const targetClaim = claims.find(c => c.id === claimId);
    if (targetClaim && targetClaim.sourcePage !== activePage) {
      setActivePage(targetClaim.sourcePage);
    }
  };

  const handleAnchorOnBlockchain = async () => {
    if (!document) return;
    setIsAnchoring(true);
    try {
      const res = await api.anchorDocument(document.id);
      setDocument(res.document);
      // Refresh claims with anchor status
      const updatedClaims = claims.map(c => ({
        ...c,
        blockchainAnchor: res.anchor
      }));
      setClaims(updatedClaims);
      setActionNotice('Anchor recorded successfully.');
    } catch (err) {
      setActionNotice(err instanceof Error ? err.message : 'Anchoring failed; no state was changed.');
    } finally {
      setIsAnchoring(false);
    }
  };

  const copyHash = () => {
    if (document) {
      navigator.clipboard.writeText(document.hashSha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Loading Document Repository & Evidence Matrix...</p>
        </div>
      </div>
    );
  }
  if (error || !document) return <div role="alert" className="m-8 rounded-xl border border-rose-800 bg-rose-950/40 p-5 text-rose-200">{error || 'Document not found'}</div>;

  const selectedClaim = claims.find(c => c.id === selectedClaimId);
  const isSessionDemo = api.isSessionDocument(docId);

  return (
    <div className="document-detail-page flex-1 flex flex-col bg-[#070b14]">
      {actionNotice&&<div role="status" className="border-b border-sky-800 bg-sky-950/40 px-4 py-2 text-xs text-sky-200">{actionNotice}</div>}
      {/* Top Bar */}
      <div className="document-detail-toolbar border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            href="/documents"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white tracking-tight">{document.title}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {document.documentType}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
              <span>SHA-256: {document.hashSha256.substring(0, 18)}...</span>
              <button onClick={copyHash} className="hover:text-white inline-flex items-center space-x-1">
                {copiedHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
              <span>•</span>
              <span className="text-slate-300">{document.issuerName}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <Link href={isSessionDemo ? '/documents/doc-1/advisor' : `/documents/${document.id}/advisor`} className="rounded-lg border border-sky-700 px-3 py-1.5 text-xs font-semibold text-sky-300">{isSessionDemo ? 'Sample Expert Review' : 'Expert Review'}</Link>
        <div className="flex items-center space-x-2.5">
          {!document.isAnchored ? (
            <button
              onClick={handleAnchorOnBlockchain}
              disabled={isAnchoring}
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all active:scale-[0.98]"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{isAnchoring ? 'Anchoring...' : 'Anchor on Blockchain'}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 text-xs font-mono text-emerald-300">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>ANCHORED: {document.blockchainTx ? document.blockchainTx.substring(0, 10) + '...' : 'EVM LEDGER'}</span>
            </div>
          )}

          {selectedClaim && (
            <button
              onClick={() => setQrModalClaim(selectedClaim)}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-medium border border-slate-700 transition-colors"
            >
              <QrCode className="h-3.5 w-3.5 text-sky-400" />
              <span>QR Verify Claim</span>
            </button>
          )}
        </div>
      </div>

      {/* SPLIT-SCREEN MAIN VIEW */}
      <div className="document-detail-layout flex-1 flex flex-col lg:flex-row">
        {/* LEFT PANE: HIGH-FIDELITY DOCUMENT VIEWER CANVAS */}
        <div className="flex-1 p-3 sm:p-4 overflow-hidden flex flex-col">
          <DocumentViewerCanvas
            document={document}
            claims={claims}
            advisorTerms={advisorTerms}
            selectedClaimId={selectedClaimId}
            onSelectClaim={handleSelectClaim}
            activePage={activePage}
            onPageChange={setActivePage}
          />
        </div>

        {/* RIGHT PANE: EXTRACTED STRUCTURED CLAIMS */}
        <div className="w-full lg:w-[420px] xl:w-[460px] border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#090d18] flex flex-col overflow-hidden shrink-0">
          {/* Claims Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Extracted Structured Claims
              </h2>
              <p className="text-[11px] text-slate-400">
                Click any claim to highlight exact bounding evidence
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
              {claims.length} CLAIMS
            </span>
          </div>

          {/* Claims List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {claims.map((claim) => {
              const isSelected = claim.id === selectedClaimId;
              return (
                <ClaimBadge
                  key={claim.id}
                  claim={claim}
                  isSelected={isSelected}
                  onClick={() => handleSelectClaim(claim.id)}
                />
              );
            })}
          </div>

          {/* Bottom Selected Claim Details Panel */}
          {selectedClaim && (
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono uppercase text-[10px]">Active Claim Focus</span>
                <Link
                  href={`/claims/${selectedClaim.id}`}
                  className="text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
                >
                  <span>Dedicated Claim Verification Screen</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-300 font-mono text-[11px]">
                  <span>Evidence Bounds:</span>
                  <span className="text-sky-400">
                    Page {selectedClaim.sourcePage} (X: {selectedClaim.evidenceRegion.x}%, Y: {selectedClaim.evidenceRegion.y}%)
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] italic bg-slate-950 p-2 rounded border border-slate-800">
                  &ldquo;{selectedClaim.rawSnippet}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Verification Modal */}
      {qrModalClaim && (
        <QRVerificationModal
          claim={qrModalClaim}
          isOpen={!!qrModalClaim}
          onClose={() => setQrModalClaim(null)}
        />
      )}
    </div>
  );
}
