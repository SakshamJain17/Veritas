'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Search, 
  Filter, 
  ArrowRight, 
  FileText, 
  Building2,
  QrCode
} from 'lucide-react';
import { api } from '@/lib/api';
import { Claim, Contradiction } from '@/lib/types';
import ContradictionBanner from '@/components/ContradictionBanner';
import QRVerificationModal from '@/components/QRVerificationModal';

export default function ClaimsExplorerPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [qrModalClaim, setQrModalClaim] = useState<Claim | null>(null);

  const loadData = async () => {
    try {
      const [fetchedClaims, fetchedConflicts] = await Promise.all([
        api.getClaims(),
        api.getContradictions()
      ]);
      setClaims(fetchedClaims);
      setContradictions(fetchedConflicts);
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getClaims(), api.getContradictions()]).then(([fetchedClaims, fetchedConflicts]) => {
      if (cancelled) return;
      setClaims(fetchedClaims);
      setContradictions(fetchedConflicts);
    }).catch(err => console.error('Failed to load claims:', err)).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const activeConflict = contradictions.find(c => c.status === 'REQUIRES HUMAN REVIEW');

  const filteredClaims = claims.filter(c => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'CONFLICT' && !c.hasConflict) return false;
      if (statusFilter === 'VERIFIED' && (c.verificationStatus !== 'VERIFIED' || c.hasConflict)) return false;
      if (statusFilter === 'PENDING' && c.verificationStatus !== 'PENDING_REVIEW') return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.subject.toLowerCase().includes(q) ||
        c.predicate.toLowerCase().includes(q) ||
        c.object.toLowerCase().includes(q) ||
        c.issuerName.toLowerCase().includes(q) ||
        c.sourceDocumentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 bg-[#070b14] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-1">
            <span>STRUCTURED CLAIM EXPLORER</span>
            <span>•</span>
            <span className="text-slate-400">ATTESTED TRIPLES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Evidence-Backed Claims
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Atomic facts extracted from public records, bounded by physical pixel coordinates and anchored to cryptographic proofs.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sky-400">
          Total Indexed: <strong>{filteredClaims.length}</strong> claims
        </span>
      </div>

      {/* Contradiction Banner */}
      {activeConflict && (
        <ContradictionBanner
          contradiction={activeConflict}
          onResolved={loadData}
        />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims by subject, predicate, object, or authority..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'VERIFIED', label: 'Verified' },
            { id: 'CONFLICT', label: 'Conflicts' },
            { id: 'PENDING', label: 'Pending' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === f.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table / Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Predicate & Subject</th>
                <th className="px-6 py-3.5">Claimed Object Value</th>
                <th className="px-6 py-3.5">Evidence Source</th>
                <th className="px-6 py-3.5">Authority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">AI Conf.</th>
                <th className="px-6 py-3.5">Provenance</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
              {filteredClaims.map((claim) => {
                const isConflict = claim.hasConflict;
                const isAnchored = claim.blockchainAnchor.isAnchored;

                return (
                  <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white uppercase font-mono tracking-tight">
                          {claim.predicate}
                        </span>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {claim.subject}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-white text-sm">
                      {claim.object}
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-slate-300">
                      <Link
                        href={`/documents/${claim.sourceDocumentId}`}
                        className="hover:text-sky-400 hover:underline flex items-center space-x-1"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[160px]">{claim.sourceDocumentName}</span>
                      </Link>
                      <span className="text-slate-500 text-[10px]">P.{claim.sourcePage} (Region Bounded)</span>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[150px]">{claim.issuerName}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isConflict ? (
                        <span className="inline-flex items-center space-x-1 rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          <span>CONFLICT</span>
                        </span>
                      ) : claim.verificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center space-x-1 rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>VERIFIED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-800">
                          <Clock className="h-2.5 w-2.5" />
                          <span>REVIEW</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-sky-400">
                      {Math.round(claim.confidence * 100)}%
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px]">
                      {isAnchored ? (
                        <div className="flex items-center space-x-1 text-emerald-400">
                          <Lock className="h-3 w-3" />
                          <span>#{claim.blockchainAnchor.blockNumber}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unanchored</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setQrModalClaim(claim)}
                          title="Generate Verification QR"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>

                        <Link
                          href={`/claims/${claim.id}`}
                          className="flex items-center space-x-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 px-2.5 py-1 text-xs font-semibold transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal */}
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
