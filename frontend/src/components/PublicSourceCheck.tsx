'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SourceCheck } from '@/lib/types';

export default function PublicSourceCheck({ claimId }: { claimId: string }) {
  const [check, setCheck] = useState<SourceCheck | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSourceCheck(claimId).then(setCheck).catch(() => setError('The source-check service is unavailable.'));
  }, [claimId]);

  async function run() {
    setBusy(true);
    setError('');
    try {
      setCheck(await api.runSourceCheck(claimId));
    } catch {
      setError('The source check could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full rounded-2xl border border-sky-800/60 bg-slate-900/95 p-5 space-y-4 text-sm text-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-white">Public source observation</h2>
          <p className="text-xs text-slate-400">TinyFish Fetch · separate from claim, issuer, and ledger checks</p>
        </div>
        <span className="rounded border border-sky-700 bg-sky-950 px-2 py-1 text-xs font-mono text-sky-300">{check?.status?.replaceAll('_', ' ') || 'LOADING'}</span>
      </div>
      <p className="text-xs text-slate-300">{error || check?.message || 'Loading source profile…'}</p>
      {check?.sourceUrl && (
        <a className="block break-all text-xs text-sky-400 underline" href={check.finalUrl || check.sourceUrl} target="_blank" rel="noopener noreferrer">
          {check.pageTitle || check.sourceLabel || check.sourceUrl}
        </a>
      )}
      {(check?.status === 'OBSERVED' || check?.status === 'SAVED_DEMO') && (
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 space-y-2 text-xs">
          <p className="text-slate-300">{check.excerpt}</p>
          <p className="text-slate-500">{check.status === 'OBSERVED' ? `Observed ${check.observedAt}` : 'Saved fallback · live API key not configured'} · Content SHA-256 {check.contentSha256}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-slate-950 p-2">Owner/claim match: <strong>Not checked</strong></div>
        <div className="rounded-lg bg-slate-950 p-2">Issuer attestation: <strong>Not checked</strong></div>
      </div>
      <p className="text-xs text-amber-300">This public dashboard supplies jurisdiction context only. It does not prove who owns the fictional demo parcel.</p>
      {check?.status !== 'UNSUPPORTED' && (
        <button onClick={run} disabled={busy} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
          {busy ? 'Checking public source…' : check?.status === 'SAVED_DEMO' ? 'Retry live TinyFish check' : 'Run TinyFish check'}
        </button>
      )}
    </section>
  );
}
