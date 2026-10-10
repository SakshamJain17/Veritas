'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  ArrowRight, 
  UploadCloud, 
  Copy, 
  Check, 
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '@/lib/api';
import { Document } from '@/lib/types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDocuments().then(docs => {
      setDocuments(docs);
      setLoading(false);
    });
  }, []);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="flex-1 bg-[#070b14] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-1">
            <span>DOCUMENT REPOSITORY</span>
            <span>•</span>
            <span className="text-slate-400">DEMO RECORD INDEX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Public Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Catalog of ingested deeds, licenses, permits, and receipts anchored to cryptographic fingerprints.
          </p>
        </div>

        <Link
          href="/upload"
          className="flex items-center space-x-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-600/20 transition-all"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Record</span>
        </Link>
      </div>

      {/* Document Grid / Table */}
      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => {
          const isAnchored = doc.isAnchored;
          const isConflict = doc.status === 'CONFLICT_DETECTED';

          return (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Document Icon & Titles */}
              <div className="flex items-start space-x-4 min-w-0">
                <div className={`p-3 rounded-xl shrink-0 ${
                  isConflict 
                    ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60' 
                    : 'bg-sky-950/60 text-sky-400 border border-sky-800/60'
                }`}>
                  <FileText className="h-6 w-6" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {doc.documentType}
                    </span>
                    <span className="text-xs text-slate-400">
                      {doc.language} • {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}
                    </span>
                    {isConflict && (
                      <span className="inline-flex items-center space-x-1 rounded bg-rose-950 px-2 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-800">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        <span>CONFLICT DETECTED</span>
                      </span>
                    )}
                    {isAnchored && (
                      <span className="inline-flex items-center space-x-1 rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-800">
                        <Lock className="h-2.5 w-2.5" />
                        <span>ANCHORED</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight truncate max-w-xl">
                    {doc.title}
                  </h3>

                  {/* Fingerprint row */}
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 pt-1">
                    <span>SHA-256:</span>
                    <span className="text-slate-300 truncate max-w-[200px] sm:max-w-xs">{doc.hashSha256}</span>
                    <button
                      onClick={() => copyHash(doc.hashSha256)}
                      className="p-1 hover:text-white rounded"
                      title="Copy fingerprint"
                    >
                      {copiedHash === doc.hashSha256 ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Extracted Claims</span>
                  <p className="text-sm font-bold text-sky-400 font-mono">
                    {doc.claimsCount} claims
                  </p>
                  <span className="text-[10px] text-slate-500 truncate block max-w-[140px]">
                    {doc.issuerName}
                  </span>
                </div>

                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center space-x-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors shadow-sm"
                >
                  <span>Open Viewer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
