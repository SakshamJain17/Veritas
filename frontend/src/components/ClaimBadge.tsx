'use client';

import React from 'react';
import { Claim } from '@/lib/types';
import { CheckCircle2, AlertTriangle, ShieldCheck, Lock, XCircle, Clock } from 'lucide-react';

interface Props {
  claim: Claim;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export default function ClaimBadge({ claim, isSelected, onClick, compact }: Props) {
  const isVerified = claim.verificationStatus === 'VERIFIED';
  const hasConflict = claim.hasConflict;
  const isPending = claim.verificationStatus === 'PENDING_REVIEW';
  const isRevoked = claim.verificationStatus === 'REVOKED';

  const confidencePct = Math.round(claim.confidence * 100);

  return (
    <div
      onClick={onClick}
      className={`group relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? hasConflict
            ? 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/50'
            : 'bg-sky-950/40 border-sky-500/80 shadow-lg shadow-sky-950/50'
          : hasConflict
          ? 'bg-slate-900/60 border-rose-900/40 hover:border-rose-700/60 hover:bg-slate-900/90'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left side: Predicate & Object */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              {claim.predicate}
            </span>
            {hasConflict && (
              <span className="inline-flex items-center space-x-1 rounded bg-rose-900/60 px-1.5 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-700/60">
                <AlertTriangle className="h-2.5 w-2.5" />
                <span>CONFLICT</span>
              </span>
            )}
            {claim.blockchainAnchor.isAnchored && (
              <span className="inline-flex items-center space-x-0.5 rounded bg-emerald-950/80 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400 border border-emerald-800/60">
                <Lock className="h-2.5 w-2.5" />
                <span>ANCHORED</span>
              </span>
            )}
          </div>

          <p className="text-sm font-semibold text-white tracking-tight truncate">
            {claim.object}
          </p>

          {!compact && (
            <p className="text-[11px] text-slate-400 truncate">
              Subject: <span className="text-slate-300 font-mono">{claim.subject}</span> • Page {claim.sourcePage}
            </p>
          )}
        </div>

        {/* Right side: AI Confidence Tier */}
        <div className="text-right shrink-0">
          <div className="inline-flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              AI Conf.
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                confidencePct >= 95
                  ? 'text-sky-400'
                  : confidencePct >= 85
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {confidencePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Snippet preview if expanded */}
      {!compact && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 truncate max-w-[240px] italic">
            &ldquo;{claim.rawSnippet}&rdquo;
          </span>
          <span className="text-sky-400 font-medium group-hover:underline ml-2 shrink-0">
            View evidence →
          </span>
        </div>
      )}
    </div>
  );
}
