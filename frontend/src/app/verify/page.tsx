'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, QrCode, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPortalLookupPage() {
  const router = useRouter();
  const [claimInput, setClaimInput] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput.trim()) return;
    const cleanId = claimInput.trim().toLowerCase();
    router.push(`/verify/${cleanId}`);
  };

  return (
    <div className="flex-1 bg-[#070b14] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Verification Emblem */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white flex items-center justify-center shadow-xl shadow-sky-500/20">
          <ShieldCheck className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-sky-950/60 border border-sky-800/60 px-3 py-1 text-xs font-mono text-sky-400">
            <Lock className="h-3 w-3" />
            <span>INDEPENDENT THIRD-PARTY VERIFICATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verify a Public Claim
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Enter a Claim Identifier or cryptographic proof hash to verify without requiring a wallet or logging in.
          </p>
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={claimInput}
              onChange={(e) => setClaimInput(e.target.value)}
              placeholder="e.g. claim-1 or 0x8a2f..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition-all active:scale-[0.98]"
          >
            <span>Verify Claim Immutability</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Sample Links */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase">
            Try Demo Claim Identifiers:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/verify/claim-1"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 hover:border-sky-500 font-mono text-xs transition-colors"
            >
              claim-1 (Owner: Rahul Sharma)
            </Link>
            <Link
              href="/verify/claim-5"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-sky-500 font-mono text-xs transition-colors"
            >
              claim-5 (Trade License)
            </Link>
            <Link
              href="/verify/claim-9"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:border-rose-500 font-mono text-xs transition-colors"
            >
              claim-9 (Conflict Demo)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
