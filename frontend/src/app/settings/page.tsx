'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  Network, 
  Check, 
  Copy
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [networkMode, setNetworkMode] = useState<'demo' | 'testnet'>('demo');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      console.error('Error resetting demo:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const copyVal = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 bg-[#070b14] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-1">
          <span>CONFIGURATION & ENVIRONMENT</span>
          <span>•</span>
          <span className="text-slate-400">LEDGER SETTINGS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Review the simulated network and contract source references, and reset the hackathon demonstration state.
        </p>
      </div>

      {/* Network Mode Switcher */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Blockchain Network Execution Mode
              </h3>
              <p className="text-xs text-slate-400">
                This prototype runs only on the simulated demo network. Live EVM testnet support is not connected.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-sky-400">
            CURRENT: {networkMode.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => setNetworkMode('demo')}
            className={`p-4 rounded-xl border text-left transition-all ${
              networkMode === 'demo'
                ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-white">DEMO NETWORK (EVM SIMULATED)</span>
              {networkMode === 'demo' && <Check className="h-4 w-4 text-sky-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Active. Document fingerprints use real SHA-256; transaction hashes, block confirmations, and gas values are simulated.
            </p>
          </button>

          <button
            disabled
            className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-left opacity-60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-white">EVM TESTNET</span>
              <span className="text-[10px] font-mono text-slate-400">NOT CONNECTED</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Wallet connection, RPC configuration, deployment, and live transaction submission are not implemented in this prototype.
            </p>
          </button>
        </div>
      </div>

      {/* Smart Contract Addresses */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <Lock className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Demo Contract References (Solidity 0.8.20 — Not Deployed)
          </h3>
        </div>

        <div className="space-y-3 text-xs font-mono">
          {[
            { name: 'DocumentRegistry.sol', address: '0x71C2B9a0189A4eF3320c028a1F228498893181aB', desc: 'Anchors document fingerprints and issuer addresses' },
            { name: 'ClaimRegistry.sol', address: '0x4389AcB607E815D8e2A5A4eF0a4B54b08F908332', desc: 'Stores claim hashes and bounded evidence commitments' },
            { name: 'IssuerRegistry.sol', address: '0x24BC772fA1829037418A375c329482910399fE42', desc: 'Maintains verified public authorities and revocations' },
            { name: 'VerificationRegistry.sol', address: '0x89D429188491A82749210B38491029481944cC19', desc: 'Records third-party queries and audit commitments' },
          ].map(c => (
            <div key={c.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-slate-300">
                <span className="font-bold text-white">{c.name}</span>
                <div className="flex min-w-0 items-start gap-2 text-sky-400">
                  <span className="min-w-0 break-all">{c.address}</span>
                  <button
                    onClick={() => copyVal(c.address, c.name)}
                    className="hover:text-white p-0.5"
                    title="Copy Address"
                  >
                    {copiedKey === c.name ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Model Callout */}
      <div className="p-6 rounded-2xl bg-sky-950/20 border border-sky-800/40 space-y-3">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold uppercase">
          <ShieldCheck className="h-4 w-4" />
          <span>Selective Evidence Disclosure</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          In this demo, uploaded file bytes are hashed and discarded; they are not saved. A third-party verifier sees the selected evidence snippet and claim metadata, not the complete source document. Blockchain anchors are simulated, and no encryption or zero-knowledge proof is implemented.
        </p>
      </div>

      {/* Reset Demo State Button */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">Reset Demo Environment</h3>
          <p className="text-xs text-slate-400">
            Restore documents, claims, contradictions, and audit trail back to pristine judging state.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center justify-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
        >
          <RotateCcw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{resetSuccess ? 'Restored Pristine State!' : 'Reset Demo Data'}</span>
        </button>
      </div>
    </div>
  );
}
