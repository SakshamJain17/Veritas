'use client';

import React, { useState } from 'react';
import { Contradiction } from '@/lib/types';
import { AlertTriangle, ShieldAlert, Check, X, FileQuestion, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface Props {
  contradiction: Contradiction;
  onResolved?: () => void;
}

export default function ContradictionBanner({ contradiction, onResolved }: Props) {
  const [loading, setLoading] = useState(false);
  const [resolvedStatus, setResolvedStatus] = useState<string | null>(contradiction.reviewAction || null);

  const handleReviewAction = async (action: string) => {
    setLoading(true);
    try {
      await api.reviewContradiction(contradiction.id, action, `Action taken by auditor: ${action}`);
      setResolvedStatus(action);
      if (onResolved) onResolved();
    } catch (err) {
      console.error('Error reviewing contradiction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-600/40 bg-gradient-to-r from-rose-950/50 via-[#180e1a]/80 to-slate-900/90 p-4 sm:p-5 shadow-xl">
      {/* Decorative side accent */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-500" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Icon & Alert title */}
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                ⚠ CONTRADICTION DETECTED
              </span>
              <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-800">
                STATUS: {resolvedStatus ? `REVIEWED (${resolvedStatus})` : contradiction.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              Inconsistent <span className="text-rose-300 underline underline-offset-4">{contradiction.field}</span> Claims Across Records
            </h3>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Target Entity: <strong className="font-mono text-sky-300">{contradiction.entitySubject}</strong>.
              {' '}
              <span className="text-slate-400 italic">
                &ldquo;{contradiction.explanation}&rdquo;
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls for Human Reviewer */}
        {!resolvedStatus ? (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleReviewAction('FLAG_INCONSISTENCY')}
              disabled={loading}
              className="flex items-center space-x-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors"
            >
              <FileQuestion className="h-3.5 w-3.5" />
              <span>Flag Inconsistency</span>
            </button>
            <button
              onClick={() => handleReviewAction('DISMISS')}
              disabled={loading}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 text-xs text-emerald-300 font-mono flex items-center space-x-1.5">
            <Check className="h-4 w-4" />
            <span>Auditor Decision Recorded: {resolvedStatus}</span>
          </div>
        )}
      </div>

      {/* Breakdown of conflicting values across documents */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-rose-900/40 text-xs">
        {contradiction.valuesFound.map((val, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800"
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">Extracted Value:</span>
              <p className="font-bold text-white text-sm mt-0.5">{val.value}</p>
              <div className="mt-1 space-y-0.5 text-[11px] text-slate-400">
                {val.docNames.map((dName, dIdx) => (
                  <p key={dIdx} className="text-slate-300 font-mono text-[10px] truncate max-w-xs">
                    • {dName} (Page {val.pages[dIdx] || 1})
                  </p>
                ))}
              </div>
            </div>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono font-bold text-sky-400 shrink-0">
              {val.docCount} {val.docCount === 1 ? 'doc' : 'docs'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
