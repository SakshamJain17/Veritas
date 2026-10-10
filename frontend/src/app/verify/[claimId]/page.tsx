'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Building2, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Copy, 
  Check,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { api } from '@/lib/api';
import { PublicVerificationPackage } from '@/lib/types';
import PublicSourceCheck from '@/components/PublicSourceCheck';

export default function PublicClaimVerificationPage({ params }: { params: Promise<{ claimId: string }> }) {
  const resolvedParams = use(params);
  const claimId = resolvedParams.claimId;

  const [verification, setVerification] = useState<PublicVerificationPackage | null>(null);
  const [showEvidence, setShowEvidence] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    api.verifyClaimPublic(claimId).then(data => {
      setVerification(data);
      setLoading(false);
    });
  }, [claimId]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading || !verification) {
    return (
      <div className="flex-1 bg-[#070b14] flex items-center justify-center p-8 text-slate-400">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono">Loading demo claim record...</p>
        </div>
      </div>
    );
  }

  const isVerified = verification.isVerified;
  const isConsistent = verification.crossDocumentConsistency.isConsistent;
  const isAnchored = verification.blockchain.isAnchored;

  return (
    <div className="flex-1 bg-[#070b14] flex flex-col items-center justify-start py-8 px-4 sm:px-6 max-w-2xl mx-auto w-full space-y-6">
      {/* Brand Header */}
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-md">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-wider text-white">VERITAS</span>
          <span className="text-[10px] text-slate-400 font-mono block -mt-1">
            Public Demo Claim Viewer
          </span>
        </div>
      </div>

      {/* MAIN RESULT CARD */}
      <div className={`w-full rounded-2xl border p-6 sm:p-8 space-y-6 shadow-2xl ${
        isVerified && isConsistent
          ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900/95 to-slate-900/95 border-emerald-500/60'
          : !isConsistent
          ? 'bg-gradient-to-b from-rose-950/40 via-slate-900/95 to-slate-900/95 border-rose-500/60'
          : 'bg-gradient-to-b from-amber-950/40 via-slate-900/95 to-slate-900/95 border-amber-500/60'
      }`}>
        {/* Verification Status Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            {isVerified && isConsistent ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            ) : !isConsistent ? (
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <AlertTriangle className="h-7 w-7" />
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <ShieldAlert className="h-7 w-7" />
              </div>
            )}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                DEMO RECORD STATUS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isVerified && isConsistent ? 'CLAIM VERIFIED ✓' : !isConsistent ? 'CONTRADICTION DETECTED ⚠' : 'NOT INDEPENDENTLY VERIFIED'}
              </h2>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {verification.claim.id.toUpperCase()}
          </span>
        </div>

        {/* Claim Statement */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Structured Demo Claim</span>
          <div className="text-lg font-bold text-white">
            <span className="text-slate-400 font-normal">{verification.claim.predicate}: </span>
            <span className="text-emerald-300 underline underline-offset-4">{verification.claim.object}</span>
          </div>
          <div className="text-xs text-slate-400">
            Entity: <strong className="text-slate-200 font-mono">{verification.claim.subject}</strong>
          </div>
        </div>

        {/* Verification Checkpoints Checklist */}
        <div className="space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-300">Evidence Physical Integrity:</span>
            <span className="text-amber-300 font-bold flex items-center space-x-1">
              <span>Original file unavailable for recheck</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-300">Issuing Authority Status:</span>
            <span className="text-amber-300 font-bold flex items-center space-x-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>Demo registry entry ({verification.issuer.name.substring(0, 16)}...)</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-300">Blockchain Cryptographic Anchor:</span>
            <span className="text-amber-300 font-bold flex items-center space-x-1">
              <Lock className="h-3.5 w-3.5" />
              <span>Simulated anchor (#{verification.blockchain.blockNumber || 18472921})</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-300">Cross-Document Consistency:</span>
            {isConsistent ? (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>CONSISTENT (MATCH)</span>
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center space-x-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>INCONSISTENT WITH RECORD C</span>
              </span>
            )}
          </div>
        </div>

        {/* EVIDENCE ACCORDION (PRIVACY-PRESERVING) */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-200 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-sky-400" />
              <span>Targeted Evidence Snippet (Privacy-Preserving)</span>
            </div>
            {showEvidence ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showEvidence && (
            <div className="p-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="space-y-1 font-mono text-[11px] text-slate-400">
                <p>SOURCE DOCUMENT: <span className="text-white">{verification.evidence.documentTitle}</span></p>
                <p>PAGE NUMBER: <span className="text-sky-400 font-bold">Page {verification.evidence.pageNumber}</span></p>
                <p>BOUNDS: <span className="text-slate-300">X: {verification.evidence.evidenceRegion.x}%, Y: {verification.evidence.evidenceRegion.y}%</span></p>
              </div>

              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800 font-serif italic text-slate-200 text-xs">
                &ldquo;{verification.evidence.snippetText}&rdquo;
              </div>

              {/* Privacy callout */}
              <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-slate-300 flex items-start space-x-2">
                <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <p>{verification.evidence.privacyNotice}</p>
              </div>
            </div>
          )}
        </div>

        {/* Blockchain Proof Footnote */}
        <div className="pt-2 text-center text-[10px] font-mono text-slate-500 space-y-1 border-t border-slate-800/80">
          <p>IMMUTABLE FINGERPRINT: {verification.claim.claimHash}</p>
          <p>Simulated demo contract: 0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332</p>
        </div>
      </div>
      <PublicSourceCheck claimId={claimId} />
    </div>
  );
}
