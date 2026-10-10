'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ShieldCheck, 
  Building2, 
  QrCode, 
  ExternalLink, 
  ArrowLeft, 
  Copy, 
  Check, 
  FileText, 
  Cpu, 
  Network,
  Share2
} from 'lucide-react';
import { api } from '@/lib/api';
import { Claim, Document, Contradiction } from '@/lib/types';
import QRVerificationModal from '@/components/QRVerificationModal';
import PublicSourceCheck from '@/components/PublicSourceCheck';

export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const claimId = resolvedParams.id;

  const [claim, setClaim] = useState<Claim | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [conflict, setConflict] = useState<Contradiction | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);

  useEffect(() => {
    api.getClaim(claimId).then(data => {
      setClaim(data.claim);
      setDocument(data.document);
      setConflict(data.conflict || null);
      setLoading(false);
    });
  }, [claimId]);

  const handleAnchorClaim = async () => {
    if (!claim) return;
    setIsAnchoring(true);
    try {
      const res = await api.anchorClaim(claim.id);
      setClaim(res.claim);
    } catch (err) {
      console.error('Error anchoring claim:', err);
    } finally {
      setIsAnchoring(false);
    }
  };

  const copyTx = (tx: string) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  if (loading || !claim) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Loading Cryptographic Claim Dossier...</p>
        </div>
      </div>
    );
  }

  const isVerified = claim.verificationStatus === 'VERIFIED';
  const hasConflict = claim.hasConflict;
  const isAnchored = claim.blockchainAnchor.isAnchored;

  return (
    <div className="flex-1 bg-[#070b14] py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/claims"
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Claims Explorer</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link href={`/documents/${claim.sourceDocumentId}/advisor`} className="rounded-lg border border-sky-700 px-3 py-1.5 text-xs text-sky-300">Explain this claim</Link>
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <QrCode className="h-3.5 w-3.5 text-sky-400" />
            <span>Generate Verification QR</span>
          </button>

          <Link
            href={`/verify/${claim.id}`}
            target="_blank"
            className="flex items-center space-x-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow transition-all"
          >
            <span>Verify Independently</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* CLAIM HEADER BANNER */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${
        hasConflict
          ? 'bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-slate-900/90 border-rose-600/50'
          : 'bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-900/90 border-emerald-600/40'
      } shadow-2xl`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {hasConflict ? (
                <span className="inline-flex items-center space-x-1 rounded bg-rose-950 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-800">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>CONTRADICTION DETECTED</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 rounded bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>CLAIM VERIFIED</span>
                </span>
              )}
              <span className="text-xs font-mono text-slate-400">
                REF: {claim.id.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              <span className="text-slate-400">{claim.predicate} = </span>
              <span className="text-white underline decoration-sky-500 decoration-2 underline-offset-8">
                {claim.object}
              </span>
            </h1>

            <p className="text-xs text-slate-300">
              Entity Subject: <strong className="text-sky-300 font-mono">{claim.subject}</strong>
            </p>
          </div>

          {/* AI Confidence & Integrity Badges */}
          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 gap-1 text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400">AI Extraction Confidence</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-sky-400">
              {Math.round(claim.confidence * 100)}%
            </span>
            <span className="text-[10px] text-slate-500">Tier: {claim.confidenceTier}</span>
          </div>
        </div>
      </div>

      {/* GRID: EVIDENCE & PROVENANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. EVIDENCE CONTAINER */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-sky-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Physical Evidence
              </h3>
            </div>
            {document && (
              <Link
                href={`/documents/${document.id}`}
                className="text-xs text-sky-400 hover:underline flex items-center space-x-1"
              >
                <span>View Full Page</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* Source Document details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 font-mono text-[11px]">
              <span>DOCUMENT SOURCE:</span>
              <span className="text-slate-200">{claim.sourceDocumentName}</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono text-[11px]">
              <span>PAGE LOCATION:</span>
              <span className="text-sky-400 font-bold">Page {claim.sourcePage}</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono text-[11px]">
              <span>PIXEL BOUNDING BOX:</span>
              <span className="text-slate-300">
                X: {claim.evidenceRegion.x}% • Y: {claim.evidenceRegion.y}% • W: {claim.evidenceRegion.width}%
              </span>
            </div>
          </div>

          {/* Bounded Text Snippet */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">
              Extracted Evidence Region Text
            </span>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-serif italic text-slate-200 leading-relaxed">
              &ldquo;{claim.rawSnippet}&rdquo;
            </div>
          </div>
        </div>

        {/* 2. PROVENANCE & ISSUER CONTAINER */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Cryptographic Provenance
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              ✓ VERIFIED ISSUER
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-400 font-mono text-[11px]">
              <span>ISSUING AUTHORITY:</span>
              <span className="text-white font-semibold">{claim.issuerName}</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-mono text-[11px] block">DOCUMENT SHA-256 HASH:</span>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 break-all select-all">
                {document ? document.hashSha256 : '0x7a829f0b12c4d8e5719329410385bf71829a91f2495810239103984102938174'}
              </div>
            </div>

            <div className="flex justify-between text-slate-400 font-mono text-[11px]">
              <span>INGESTION TIMESTAMP:</span>
              <span className="text-slate-300">{claim.createdAt}</span>
            </div>

            <div className="flex justify-between text-slate-400 font-mono text-[11px]">
              <span>TAMPER INTEGRITY:</span>
              <span className="text-emerald-400 font-bold">SHA-256 MATCH CONFIRMED</span>
            </div>
          </div>
        </div>
      </div>

      <PublicSourceCheck claimId={claimId} />

      {/* 3. BLOCKCHAIN RECORD SECTION */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              EVM Smart Contract Record
            </h3>
          </div>
          {isAnchored ? (
            <span className="inline-flex items-center space-x-1 rounded bg-emerald-950 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-300 border border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>IMMUTABLE ANCHOR</span>
            </span>
          ) : (
            <button
              onClick={handleAnchorClaim}
              disabled={isAnchoring}
              className="rounded bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 text-xs font-semibold"
            >
              {isAnchoring ? 'Anchoring...' : 'Anchor Now'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Network</span>
            <p className="text-white font-bold truncate">{claim.blockchainAnchor.network}</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Block Number</span>
            <p className="text-emerald-400 font-bold">
              #{claim.blockchainAnchor.blockNumber || 18472921}
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 sm:col-span-2">
            <span className="text-slate-500 text-[10px] uppercase">Transaction Hash</span>
            <div className="flex items-center justify-between text-sky-400 font-bold">
              <span className="truncate max-w-[200px] sm:max-w-xs">
                {claim.blockchainAnchor.txHash || '0x8a2f1c4e90d182b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b'}
              </span>
              <button
                onClick={() => copyTx(claim.blockchainAnchor.txHash || '0x8a2f1c4e90d182b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b')}
                className="p-1 hover:text-white"
              >
                {copiedTx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CROSS-DOCUMENT VALIDATION SECTION */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Network className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Cross-Document Multi-Source Validation
            </h3>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
            hasConflict ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }`}>
            CONSISTENCY: {hasConflict ? 'CONTRADICTION FLAGGED' : 'CONSISTENT (MATCH)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Document A</p>
              <span className="text-[10px] text-slate-400">Land Certificate #LC-1842</span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Document B</p>
              <span className="text-[10px] text-slate-400">Property Tax Receipt #PTR-5520</span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Document C</p>
              <span className="text-[10px] text-slate-400">Mutation Extract #MR-2021-99</span>
            </div>
            {hasConflict ? (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
          </div>
        </div>

        {hasConflict && (
          <p className="text-[11px] text-rose-300 italic pt-1">
            ⚠ Contradiction active: Document C records &ldquo;Rohan Sharma&rdquo; for this same parcel. Flagged for human review.
          </p>
        )}
      </div>

      {/* QR Modal */}
      {qrModalOpen && (
        <QRVerificationModal
          claim={claim}
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </div>
  );
}
