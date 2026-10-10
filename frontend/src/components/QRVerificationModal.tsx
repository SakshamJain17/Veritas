'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Claim } from '@/lib/types';
import { X, Copy, Check, ExternalLink, ShieldCheck, QrCode } from 'lucide-react';
import Link from 'next/link';

interface Props {
  claim: Claim;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRVerificationModal({ claim, isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOrigin(window.location.origin));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!isOpen) return null;

  const verifyUrl = `${origin}/verify/${claim.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-[#0d1527] p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Public Verification QR
            </h3>
            <p className="text-xs text-slate-400">
              Independent Third-Party Verification Portal
            </p>
          </div>
        </div>

        {/* Claim Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-6 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>CLAIM IDENTIFIER</span>
            <span className="text-sky-400 font-bold">{claim.id}</span>
          </div>
          <div className="text-sm font-semibold text-white">
            <span className="text-slate-400">{claim.predicate}: </span>
            <span>{claim.object}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Source: {claim.sourceDocumentName} • Issuer: {claim.issuerName}
          </div>
        </div>

        {/* High Contrast QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-inner mb-6 mx-auto w-fit">
          <QRCodeSVG
            value={verifyUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
          <div className="mt-2 text-center text-[10px] font-mono text-slate-700 font-semibold tracking-wider uppercase">
            Scan with smartphone camera
          </div>
        </div>

        {/* Privacy reassurance */}
        <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-slate-300 flex items-start space-x-2 mb-6">
          <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <p>
            <strong>Selected evidence only:</strong> The public page shows the claim, selected evidence snippet, and simulated anchor metadata. This demo discards the uploaded file after hashing; it does not create a zero-knowledge proof.
          </p>
        </div>

        {/* Verification Link & Actions */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={verifyUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 select-all focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Link
              href={`/verify/${claim.id}`}
              target="_blank"
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs py-2.5 transition-all shadow-md active:scale-[0.98]"
            >
              <span>Open Public Verification Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
