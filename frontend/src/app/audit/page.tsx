'use client';

import React, { useEffect, useState } from 'react';
import { 
  History, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Copy, 
  Check, 
  Cpu, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import { AuditEvent } from '@/lib/types';

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditTrail().then(trail => {
      setEvents(trail);
      setLoading(false);
    });
  }, []);

  const copyTx = (tx: string) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const getActionBadge = (action: string) => {
    if (action.includes('ANCHORED') || action.includes('ATTESTED')) {
      return { bg: 'bg-emerald-950 text-emerald-300 border-emerald-800', icon: Lock };
    }
    if (action.includes('CONFLICT') || action.includes('REVOKED')) {
      return { bg: 'bg-rose-950 text-rose-300 border-rose-800', icon: AlertTriangle };
    }
    if (action.includes('VERIFICATION') || action.includes('CHECK')) {
      return { bg: 'bg-sky-950 text-sky-300 border-sky-800', icon: CheckCircle2 };
    }
    return { bg: 'bg-slate-900 text-slate-300 border-slate-700', icon: Clock };
  };

  return (
    <div className="flex-1 bg-[#070b14] py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-1">
            <span>APPEND-ONLY AUDIT LEDGER</span>
            <span>•</span>
            <span className="text-emerald-400">TAMPER-EVIDENT LOGS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Immutable log of document ingestions, claim generations, contradictions, attestations, and third-party verification queries.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>VerificationRegistry.sol</span>
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
        {events.map((evt, idx) => {
          const badge = getActionBadge(evt.action);
          const Icon = badge.icon;

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Timeline Node Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1 h-5 w-5 rounded-full bg-slate-900 border-2 border-sky-500 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              </div>

              {/* Event Card */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badge.bg}`}>
                      <Icon className="h-3 w-3" />
                      <span>{evt.action.replace(/_/g, ' ')}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      by <strong>{evt.actor}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {evt.timestamp}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {evt.object}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {evt.details}
                  </p>
                </div>

                {/* Blockchain transaction metadata if present */}
                {evt.txHash && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
                    <div className="flex items-center space-x-1.5 text-sky-400">
                      <Lock className="h-3 w-3 text-emerald-400" />
                      <span>TX: {evt.txHash.substring(0, 20)}...</span>
                      <button
                        onClick={() => copyTx(evt.txHash!)}
                        className="hover:text-white p-0.5"
                        title="Copy Tx Hash"
                      >
                        {copiedTx === evt.txHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>

                    {evt.blockNumber && (
                      <span className="text-slate-500">
                        Block #{evt.blockNumber}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
