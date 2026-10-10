'use client';

import React, { useState } from 'react';
import { Claim, Document, AdvisorTerm } from '@/lib/types';
import { ZoomIn, ZoomOut, FileText, ShieldCheck } from 'lucide-react';

interface Props {
  document: Document;
  claims: Claim[];
  advisorTerms?: AdvisorTerm[];
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
  activePage?: number;
  onPageChange?: (page: number) => void;
}

export default function DocumentViewerCanvas({
  document,
  claims,
  advisorTerms = [],
  selectedClaimId,
  onSelectClaim,
  activePage: controlledPage,
  onPageChange
}: Props) {
  const [internalPage, setInternalPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  const currentPage = controlledPage !== undefined ? controlledPage : internalPage;

  const handlePageSelect = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  // Find claims for current page
  const pageClaims = claims.filter(c => c.sourcePage === currentPage);
  const selectedClaim = claims.find(c => c.id === selectedClaimId);

  return (
    <div className="flex flex-col h-full bg-[#090d18] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Top toolbar */}
      <div className="document-canvas-toolbar flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex min-w-0 items-center space-x-2">
          <FileText className="h-4 w-4 text-sky-400" />
          <span className="font-medium text-slate-200 truncate max-w-xs">{document.title}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-400">
            {document.documentType}
          </span>
        </div>

        {/* Page Switcher & Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            {Array.from({ length: document.pageCount }, (_, i) => i + 1).map((pg) => {
              const hasClaims = claims.some(c => c.sourcePage === pg);
              const isSelected = currentPage === pg;
              return (
                <button
                  key={pg}
                  onClick={() => handlePageSelect(pg)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white font-bold'
                      : hasClaims
                      ? 'text-sky-300 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  P.{pg}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            <button
              onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))}
              className="p-1 hover:text-white hover:bg-slate-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[10px] w-9 text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
              className="p-1 hover:text-white hover:bg-slate-800 rounded"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document View Canvas Area */}
      <div className="relative flex-1 overflow-auto p-4 sm:p-6 bg-[#04070f] flex items-start">
        <div 
          className="relative mx-auto shrink-0 bg-[#fcfbfa] text-[#1c1d21] rounded shadow-2xl transition-all duration-200 select-none border border-amber-950/20"
          style={{
            width: `${zoomLevel}%`,
            maxWidth: `${(620 * zoomLevel) / 100}px`,
            minHeight: `${(840 * zoomLevel) / 100}px`,
            fontFamily: 'serif'
          }}
        >
          {/* Subtle paper texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbf8f2]/90 to-[#f6f2e8]/90 pointer-events-none rounded" />
          
          {/* Subtle watermark / seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
            <ShieldCheck className="w-80 h-80 text-slate-900" />
          </div>

          {/* Private advisor term markers use the same evidence boxes as claims. */}
          {advisorTerms.flatMap(term => term.appearsIn.filter(place => place.page === currentPage && place.box).map(place => (
            <div key={`${term.term}-${place.claimId}`} className="absolute z-30" style={{left:`${place.box!.x}%`,top:`${place.box!.y}%`}}>
              <button type="button" onClick={() => setActiveTerm(activeTerm===term.term?null:term.term)} onMouseEnter={() => setActiveTerm(term.term)} onMouseLeave={() => setActiveTerm(null)} className="rounded border-b border-dotted border-sky-700 bg-sky-100/90 px-1 text-[10px] text-sky-900" aria-label={`Explain ${term.term}`}>{term.term}</button>
              {activeTerm===term.term && <div role="tooltip" className="absolute left-0 top-6 z-40 w-60 rounded-lg border border-slate-300 bg-white p-3 text-left text-xs shadow-xl"><strong>{term.term}</strong><p className="mt-1">{term.plainMeaning}</p><p className="mt-2 text-sky-700">{term.sourceType==='glossary'?'VERITAS glossary':term.sourceType==='official'?'Official source':'General explanation — not sourced'}</p></div>}
            </div>
          )))}
          {/* Render Realistic Document Content based on page */}
          <div className="relative z-10 p-8 sm:p-10 flex flex-col h-full justify-between text-[13px] leading-relaxed">
            {/* Header section (Page 1 has official crest & seals) */}
            {currentPage === 1 ? (
              <div className="space-y-4 border-b-2 border-slate-900/80 pb-6 text-center">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 border-b border-slate-300 pb-2">
                  <span>STATE REVENUE DEPARTMENT</span>
                  <span>SECURITY FINGERPRINT: {document.hashSha256.substring(0, 14)}...</span>
                  <span>FORM #RG-204</span>
                </div>
                
                {/* Emblem & Titles */}
                <div className="py-2">
                  <div className="mx-auto w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center text-[9px] font-bold tracking-widest text-slate-800 uppercase mb-2">
                    SEAL
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900 font-serif">
                    {document.title}
                  </h1>
                  <p className="text-xs font-serif italic text-slate-700">
                    Official Statutory Record under Land Revenue & Titling Act
                  </p>
                </div>

                <div className="flex justify-between text-xs font-mono bg-slate-100 p-2.5 rounded border border-slate-300 text-left">
                  <div>
                    <span className="font-bold text-slate-800">REGISTRATION DATE:</span> 14-JUN-2019<br />
                    <span className="font-bold text-slate-800">BOOK NUMBER:</span> 44 / FOLIO: 182
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">ISSUING AUTHORITY:</span><br />
                    {document.issuerName}
                  </div>
                </div>
              </div>
            ) : currentPage === 2 ? (
              <div className="space-y-4 border-b-2 border-slate-900/80 pb-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 border-b border-slate-300 pb-1.5">
                  <span>SCHEDULE OF TITLE & OWNERSHIP</span>
                  <span>PAGE 2 OF {document.pageCount}</span>
                  <span>REF: {document.id.toUpperCase()}</span>
                </div>

                <div className="text-center py-1">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 underline">
                    SCHEDULE II: OWNERSHIP APPORTIONMENT & BOUNDARIES
                  </h2>
                </div>

                {/* Simulated text lines */}
                <div className="text-slate-800 text-[12px] space-y-3 font-serif pt-2">
                  <p>
                    Whereas pursuant to statutory registration inquiry and verification under Section 19 of the 
                    Land Titles Act, this certificate confirms the registered titleholder of the parcel described below:
                  </p>

                  <div className="p-3 bg-amber-50/60 rounded border border-amber-900/20 space-y-2">
                    <div className="font-mono text-xs">
                      <strong>1. REGISTERED TITLEHOLDER:</strong>
                      <div className="text-slate-900 font-serif font-bold text-sm pl-2">
                        RAHUL SHARMA S/O O.P. SHARMA
                      </div>
                    </div>

                    <div className="font-mono text-xs">
                      <strong>2. CADASTRAL SURVEY NUMBER:</strong>
                      <div className="text-slate-900 font-serif font-bold text-sm pl-2">
                        SURVEY PARCEL NO. 184/2
                      </div>
                    </div>

                    <div className="font-mono text-xs">
                      <strong>3. TOTAL REGISTERED EXTENT:</strong>
                      <div className="text-slate-900 font-serif font-bold text-sm pl-2">
                        2.40 ACRES (TWO POINT FOUR ZERO ACRES)
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700">
                    The title is free and clear from prior statutory attachments subject to entries recorded in Schedule III.
                  </p>
                </div>
              </div>
            ) : currentPage === 3 ? (
              <div className="space-y-4 border-b-2 border-slate-900/80 pb-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 border-b border-slate-300 pb-1.5">
                  <span>SCHEDULE III: ENCUMBRANCE SEARCH</span>
                  <span>PAGE 3 OF {document.pageCount}</span>
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 text-center">
                  ENCUMBRANCE SEARCH & LIEN STATUS CERTIFICATE
                </h2>
                <div className="p-4 bg-slate-100/70 border border-slate-300 rounded font-serif text-xs space-y-3">
                  <p>
                    Search conducted for period 01-JAN-2005 through 14-JUN-2019 in the Sub-Registrar archives.
                  </p>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 font-bold font-mono">
                    STATUS: NIL ENCUMBRANCE / NO RECORDED LIEN OR MORTGAGE
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Inspected and verified against municipal land bank ledger records.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 border-b-2 border-slate-900/80 pb-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 border-b border-slate-300 pb-1.5">
                  <span>ATTESTATION & SEALS</span>
                  <span>PAGE 4 OF {document.pageCount}</span>
                </div>
                <div className="py-6 text-center space-y-4">
                  <p className="text-xs font-serif italic text-slate-700">
                    In witness whereof the Sub-Registrar has set hand and affixed official seal of office this 14th day of June 2019.
                  </p>
                  <div className="flex justify-around items-end pt-8 font-mono text-[11px] text-slate-800">
                    <div className="text-center">
                      <div className="w-24 h-12 mx-auto border-b border-slate-600 flex items-center justify-center italic text-blue-900 font-serif">
                        R.K. Varma
                      </div>
                      <span>Sub-Registrar Officer</span>
                    </div>
                    <div className="w-20 h-20 rounded-full border-2 border-red-800/80 flex items-center justify-center text-[9px] font-bold text-red-800 text-center uppercase rotate-[-12deg]">
                      OFFICIAL<br />STAMP
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom stamp on every page */}
            <div className="pt-4 flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-300">
              <span>VERITAS CERTIFIED PUBLIC RECORD</span>
              <span>SHA-256 HASH VERIFIED</span>
              <span>DEMO EVIDENCE VIEW</span>
            </div>
          </div>

          {/* OVERLAY: Interactive Bounding Boxes for Claims on this Page */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {pageClaims.map((claim) => {
              const isSelected = claim.id === selectedClaimId;
              const box = claim.evidenceRegion;
              const hasConflict = claim.hasConflict;

              return (
                <div
                  key={claim.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClaim(claim.id);
                  }}
                  className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 rounded ${
                    isSelected
                      ? hasConflict
                        ? 'border-2 border-rose-500 bg-rose-500/25 ring-4 ring-rose-500/30'
                        : 'border-2 border-sky-500 bg-sky-500/25 ring-4 ring-sky-500/30'
                      : hasConflict
                      ? 'border border-dashed border-rose-400/80 bg-rose-400/10 hover:bg-rose-400/20'
                      : 'border border-dashed border-sky-400/80 bg-sky-400/10 hover:bg-sky-400/20'
                  }`}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`
                  }}
                  title={`Click to inspect claim: ${claim.predicate} = ${claim.object}`}
                >
                  {/* Floating Tag Label */}
                  <div
                    className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight whitespace-nowrap shadow-md transition-transform ${
                      isSelected
                        ? hasConflict
                          ? 'bg-rose-600 text-white scale-105'
                          : 'bg-sky-600 text-white scale-105'
                        : hasConflict
                        ? 'bg-rose-900/90 text-rose-200'
                        : 'bg-slate-900/90 text-sky-300'
                    }`}
                  >
                    <span>{claim.predicate}: </span>
                    <span className="font-semibold">{claim.object}</span>
                    <span className="ml-1 opacity-80 text-[9px]">({Math.round(claim.confidence * 100)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500">Claims on this page:</span>
          <span className="font-bold text-sky-400">{pageClaims.length}</span>
          {selectedClaim && selectedClaim.sourcePage === currentPage && (
            <span className="ml-2 text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              Active Focus: <strong>{selectedClaim.predicate}</strong> = {selectedClaim.object}
            </span>
          )}
        </div>

        <div className="text-[10px] font-mono text-slate-500">
          Click any highlighted bounding region to inspect provenance & evidence
        </div>
      </div>
    </div>
  );
}
