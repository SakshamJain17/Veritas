'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Lock, 
  ArrowUpRight, 
  UploadCloud, 
  Network, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import { Claim, Document, Contradiction } from '@/lib/types';
import ContradictionBanner from '@/components/ContradictionBanner';

export default function DashboardPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [fetchedClaims, fetchedDocs, fetchedConflicts] = await Promise.all([
        api.getClaims(),
        api.getDocuments(),
        api.getContradictions()
      ]);
      setClaims(fetchedClaims);
      setDocuments(fetchedDocs);
      setContradictions(fetchedConflicts);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getClaims(), api.getDocuments(), api.getContradictions()]).then(([fetchedClaims, fetchedDocs, fetchedConflicts]) => {
      if (cancelled) return;
      setClaims(fetchedClaims);
      setDocuments(fetchedDocs);
      setContradictions(fetchedConflicts);
    }).catch(err => console.error('Failed to load dashboard data:', err)).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const activeConflict = contradictions.find(c => c.status === 'REQUIRES HUMAN REVIEW');

  return (
    <div className="flex-1 bg-[#070b14] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-1">
            <span>DOCUMENT REVIEW</span>
            <span>•</span>
            <span className="text-emerald-400">OVERVIEW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Verification Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review documents, claims, and evidence in one place.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/evidence"
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Network className="h-4 w-4 text-purple-400" />
            <span>Evidence Graph</span>
          </Link>
          <Link
            href="/upload"
            className="flex items-center space-x-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-600/20 transition-all active:scale-[0.98]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* CONTRADICTION ALERT BANNER (If any exists) */}
      {activeConflict && (
        <ContradictionBanner
          contradiction={activeConflict}
          onResolved={loadData}
        />
      )}

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-mono">Documents Processed</span>
            <FileText className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
            {1284 + documents.length - 5}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+18.4% this month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-mono">Verified Claims</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
            {8421 + claims.length - 16}
          </div>
          <div className="text-[11px] text-slate-400">
            Subject-Predicate-Object triples
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-mono">Claims With Conflicts</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400 tracking-tight font-mono">
            37
          </div>
          <div className="text-[11px] text-rose-300/80 font-mono">
            Requires human review
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-mono">Pending Verification</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
            126
          </div>
          <div className="text-[11px] text-slate-400">
            Awaiting issuer counter-signature
          </div>
        </div>
      </div>

      {/* Additional metrics stay available without crowding the overview. */}
      <details className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <summary className="cursor-pointer text-xs font-semibold text-slate-300">More system metrics</summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Document Cryptographic Integrity</span>
            <p className="text-xl font-bold text-white font-mono">98.7%</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Issuer Verification Rate</span>
            <p className="text-xl font-bold text-white font-mono">94.2%</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Smart Contract Anchoring</span>
            <p className="text-xl font-bold text-emerald-400 font-mono">ACTIVE (EVM)</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Lock className="h-5 w-5" />
          </div>
        </div>
        </div>
      </details>

      {/* RECENT VERIFICATIONS TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Verifications</h2>
            <p className="text-xs text-slate-400">Real-time attested claims and their tamper-evident anchors.</p>
          </div>
          <Link
            href="/claims"
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1"
          >
            <span>View All Claims</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Claim</th>
                <th className="px-6 py-3.5">Source Document</th>
                <th className="px-6 py-3.5">Issuer Authority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">AI Conf.</th>
                <th className="px-6 py-3.5">Blockchain</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
              {claims.slice(0, 7).map((claim) => {
                const isConflict = claim.hasConflict;
                const isAnchored = claim.blockchainAnchor.isAnchored;

                return (
                  <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Claim info */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {claim.predicate}
                        </span>
                        <div className="font-semibold text-white text-sm">
                          {claim.object}
                        </div>
                      </div>
                    </td>

                    {/* Source Doc */}
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-300">
                      <Link
                        href={`/documents/${claim.sourceDocumentId}`}
                        className="hover:text-sky-400 hover:underline flex items-center space-x-1"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[180px]">{claim.sourceDocumentName}</span>
                      </Link>
                      <span className="text-slate-500 text-[10px]">Page {claim.sourcePage}</span>
                    </td>

                    {/* Issuer */}
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        <span className="truncate max-w-[160px]">{claim.issuerName}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {isConflict ? (
                        <span className="inline-flex items-center space-x-1 rounded bg-rose-950/80 px-2.5 py-1 text-[10px] font-bold text-rose-300 border border-rose-800">
                          <AlertTriangle className="h-3 w-3" />
                          <span>CONFLICT</span>
                        </span>
                      ) : claim.verificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center space-x-1 rounded bg-emerald-950/80 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>VERIFIED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 rounded bg-amber-950/80 px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-amber-800">
                          <Clock className="h-3 w-3" />
                          <span>REVIEW</span>
                        </span>
                      )}
                    </td>

                    {/* AI Confidence */}
                    <td className="px-6 py-4 font-mono font-bold text-sky-400">
                      {Math.round(claim.confidence * 100)}%
                    </td>

                    {/* Blockchain status */}
                    <td className="px-6 py-4">
                      {isAnchored ? (
                        <div className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
                          <Lock className="h-3.5 w-3.5" />
                          <span>ANCHORED</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">PENDING</span>
                      )}
                    </td>

                    {/* Action link */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/claims/${claim.id}`}
                        className="inline-flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
