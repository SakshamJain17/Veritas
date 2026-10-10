'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  Copy, 
  Lock, 
  Globe,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';
import { Issuer } from '@/lib/types';

export default function IssuersPage() {
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newJurisdiction, setNewJurisdiction] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadIssuers = async () => {
    try {
      const list = await api.getIssuers();
      setIssuers(list);
    } catch (err) {
      console.error('Failed to load issuers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    api.getIssuers().then(list => {
      if (!cancelled) setIssuers(list);
    }).catch(err => console.error('Failed to load issuers:', err)).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newJurisdiction) return;

    try {
      await api.registerIssuer({
        name: newName,
        jurisdiction: newJurisdiction,
        address: newAddress || `0x${Math.random().toString(16).substring(2, 42)}`
      });
      setIsRegisterModalOpen(false);
      setNewName('');
      setNewJurisdiction('');
      setNewAddress('');
      loadIssuers();
    } catch (err) {
      console.error('Error registering issuer:', err);
    }
  };

  const handleToggleVerify = async (id: string) => {
    try {
      await api.toggleVerifyIssuer(id);
      loadIssuers();
    } catch (err) {
      console.error('Error toggling issuer:', err);
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  return (
    <div className="flex-1 bg-[#070b14] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-1">
            <span>PUBLIC AUTHORITY REGISTRY</span>
            <span>•</span>
            <span className="text-emerald-400">IssuerRegistry.sol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Verified Public Authorities
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Certified government departments, sub-registrars, municipal corporations, and educational institutions.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Issuer</span>
        </button>
      </div>

      {/* Issuers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issuers.map((issuer) => {
          const isVerified = issuer.isVerified;

          return (
            <div
              key={issuer.id}
              className={`p-6 rounded-2xl border transition-all space-y-5 flex flex-col justify-between ${
                isVerified
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Building2 className="h-6 w-6" />
                  </div>

                  <span className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                    isVerified
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}>
                    {isVerified ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>{isVerified ? 'VERIFIED' : 'SUSPENDED'}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {issuer.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {issuer.jurisdiction}
                  </p>
                </div>

                {/* Public key / address */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <span className="text-[10px] uppercase text-slate-500 block">EVM Authority Address</span>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="truncate max-w-[190px]">{issuer.address}</span>
                    <button
                      onClick={() => copyAddress(issuer.address)}
                      className="p-1 hover:text-white"
                      title="Copy Address"
                    >
                      {copiedAddr === issuer.address ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px]">DOCUMENTS</span>
                    <p className="font-bold text-white text-sm">{issuer.documentsIssued}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">CLAIMS ATTESTED</span>
                    <p className="font-bold text-sky-400 text-sm">{issuer.claimsIssued}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => handleToggleVerify(issuer.id)}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isVerified
                        ? 'bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isVerified ? 'Revoke / Suspend Authority' : 'Re-Certify Authority'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register New Issuer Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0d1527] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Register Verified Authority</h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-mono uppercase text-slate-400">Authority Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. State Land Revenue Bureau"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono uppercase text-slate-400">Jurisdiction Division</label>
                <input
                  type="text"
                  required
                  value={newJurisdiction}
                  onChange={(e) => setNewJurisdiction(e.target.value)}
                  placeholder="e.g. Northern Regional Cadastral Council"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono uppercase text-slate-400">Public Key / EVM Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="0x... (leave empty for auto-generated)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Register Issuer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
