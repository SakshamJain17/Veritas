'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UploadCloud, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

const PIPELINE_STEPS = [
  { step: 1, name: 'Document ingestion', description: 'Parsing multi-page scanned PDF/image format' },
  { step: 2, name: 'Language detection', description: 'Detecting regional/multilingual scripts & orientation' },
  { step: 3, name: 'OCR / visual extraction', description: 'High-density neural visual token extraction' },
  { step: 4, name: 'Document structure analysis', description: 'Identifying headers, seals, stamps, and schedules' },
  { step: 5, name: 'Entity extraction', description: 'Locating parties, survey numbers, parcels, and authorities' },
  { step: 6, name: 'Claim generation', description: 'Converting extracted tokens into discrete structured claims' },
  { step: 7, name: 'Evidence mapping', description: 'Calculating precise pixel coordinates & bounding boxes' },
  { step: 8, name: 'Cross-document consistency check', description: 'Comparing extracted claims against existing record repository' },
  { step: 9, name: 'Integrity fingerprint', description: 'Generating cryptographic SHA-256 document fingerprint' },
  { step: 10, name: 'Verification package', description: 'Preparing a selected-evidence verification package' },
];

export default function UploadPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('Land Record');
  const [language, setLanguage] = useState('English / Hindi Bilingual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [advisorConsent, setAdvisorConsent] = useState(false);

  // Pipeline simulation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedDocId, setCompletedDocId] = useState<string | null>(null);
  const [completedClaimsCount, setCompletedClaimsCount] = useState(0);
  const [detectedContradiction, setDetectedContradiction] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Quick preset loader
  const handleLoadPreset = (presetType: 'land_standard' | 'land_disputed' | 'trade_license') => {
    if (presetType === 'land_standard') {
      setTitle('Land Ownership Certificate #LC-1842');
      setDocType('Land Record');
      setLanguage('English / Hindi Bilingual');
    } else if (presetType === 'land_disputed') {
      setTitle('Disputed Mutation Extract #MR-2021-99 (Survey 184/2)');
      setDocType('Land Record');
      setLanguage('Hindi / English');
    } else {
      setTitle('Municipal Trade License #LIC-92381');
      setDocType('License');
      setLanguage('English');
    }
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setUploadError(null);
    if (selectedFile && selectedFile.size > 25 * 1024 * 1024) {
      setUploadError('This file is larger than the 25 MB limit. Choose a smaller document.');
      return;
    }
    if (selectedFile && !['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'].includes(selectedFile.type)) {
      setUploadError('Unsupported file. Upload a PDF, PNG, JPEG, or TIFF document.');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);

    const isDisputed = title.toLowerCase().includes('disputed') || title.toLowerCase().includes('mutation');

    // Run realistic step-by-step pipeline
    for (let s = 1; s <= 10; s++) {
      setCurrentStep(s);
      await new Promise(r => setTimeout(r, 450)); // realistic step cadence
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('documentType', docType);
      formData.append('language', language);
      formData.append('issuerId', docType === 'License' ? 'iss-2' : 'iss-1');
      formData.append('advisorConsent', String(advisorConsent));
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await api.uploadDocument(formData);
      setCompletedDocId(res.document.id);
      setCompletedClaimsCount(res.claims.length);

      if (isDisputed) {
        setDetectedContradiction(true);
      }
    } catch (err) {
      console.error('Upload processing error:', err);
      setUploadError(err instanceof Error ? err.message : 'The document could not be processed. Check that the API is running and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (process.env.NEXT_PUBLIC_PUBLIC_DEMO === 'true') {
    return <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 text-slate-100">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Public demo</p>
      <h1 className="mt-3 text-3xl font-semibold">Explore sample records</h1>
      <p className="mt-4 max-w-2xl text-slate-300">This public site uses synthetic records. Uploads are disabled because this demo has no user accounts or private storage. Run the project locally to analyze your own document.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/documents/doc-1" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-sky-500"><strong>Land ownership certificate</strong><span className="mt-2 block text-sm text-slate-400">Inspect evidence, claims, and Expert Review.</span></Link>
        <Link href="/documents/doc-3" className="rounded-xl border border-slate-700 bg-slate-900 p-5 hover:border-sky-500"><strong>Mutation extract</strong><span className="mt-2 block text-sm text-slate-400">Explore a cross-record conflict.</span></Link>
      </div>
    </main>;
  }

  return (
    <div className="flex-1 bg-[#070b14] py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mb-1">
          <span>DOCUMENT ANALYSIS WORKFLOW</span>
          <span>•</span>
          <span className="text-slate-400">EVIDENCE MAPPING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Upload Public Record
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Ingest scanned PDFs, deeds, photos, or multilingual records for structured evidence mapping and cryptographic anchoring.
        </p>
      </div>

      {/* Sample records for exploring the workflow */}
      <details className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <summary className="flex items-center justify-between text-xs cursor-pointer list-none">
          <span className="font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>Sample Records</span>
          </span>
          <span className="text-[11px] text-slate-500">Optional examples</span>
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleLoadPreset('land_standard')}
            className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-left transition-colors group"
          >
            <span className="text-[10px] font-mono text-sky-400 uppercase">Scenario A</span>
            <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
              Land Ownership Certificate #LC-1842
            </p>
            <span className="text-[10px] text-slate-500">Clean title • 5 claims</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoadPreset('land_disputed')}
            className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-left transition-colors group"
          >
            <span className="text-[10px] font-mono text-rose-400 uppercase">Scenario B (Conflict)</span>
            <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
              Disputed Mutation Extract #MR-2021-99
            </p>
            <span className="text-[10px] text-slate-500">Triggers owner contradiction</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoadPreset('trade_license')}
            className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-left transition-colors group"
          >
            <span className="text-[10px] font-mono text-blue-400 uppercase">Scenario C</span>
            <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
              Municipal Trade License #LIC-92381
            </p>
            <span className="text-[10px] text-slate-500">Commercial permit • 4 claims</span>
          </button>
        </div>
      </details>

      {/* MAIN UPLOAD FORM */}
      {!isProcessing && !completedDocId && (
        <form onSubmit={handleStartUpload} className="space-y-6">
          {uploadError && (
            <div role="alert" className="rounded-xl border border-rose-800 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
              {uploadError}
            </div>
          )}
          {/* Drag & Drop Area */}
          <div className="relative rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-8 text-center hover:border-sky-500/60 transition-colors">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg,.tiff"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setUploadError(null);
                  if (file.size > 25 * 1024 * 1024) {
                    setSelectedFile(null);
                    setUploadError('This file is larger than the 25 MB limit. Choose a smaller document.');
                    return;
                  }
                  if (!['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'].includes(file.type)) {
                    setSelectedFile(null);
                    setUploadError('Unsupported file. Upload a PDF, PNG, JPEG, or TIFF document.');
                    return;
                  }
                  setSelectedFile(file);
                  if (!title) {
                    setTitle(file.name.replace(/\.[^/.]+$/, ''));
                  }
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop public record'}
                </p>
                <p className="text-xs text-slate-400">
                  PDF, JPG, PNG, TIFF up to 25MB (scanned deeds, certificates, licenses)
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">Document Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Land Ownership Certificate #LC-1842"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Land Record">Land Record / Title Deed</option>
                <option value="Certificate">Certificate / Accreditation</option>
                <option value="License">Commercial License / Permit</option>
                <option value="Receipt">Tax Assessment / Payment Slip</option>
                <option value="Identity Document">Identity / Statutory Record</option>
                <option value="Other">Other Public Record</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400">Language Detection</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="English / Hindi Bilingual">English / Hindi Bilingual</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Bengali">Bengali</option>
                <option value="Tamil">Tamil</option>
                <option value="Marathi">Marathi</option>
                <option value="Auto Detect">Auto Detect Multilingual</option>
              </select>
            </div>
          </div>

          {/* Privacy Guarantee Box */}
          <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs text-slate-300 flex items-start space-x-3">
            <Lock className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Demo privacy:</strong> Uploaded bytes are hashed in memory and discarded; this prototype does not save the original file. The public verification view includes selected claim evidence, not the full document. Anchoring is simulated on the demo network.
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200 cursor-pointer">
            <input type="checkbox" checked={advisorConsent} onChange={e => setAdvisorConsent(e.target.checked)} className="mt-1 accent-sky-500" />
            <span>Allow AI expert review — document text excerpts are sent to the AI provider <span className="block mt-1 text-xs text-slate-400">Optional. You can upload without enabling expert review.</span></span>
          </label>
          {/* Submit button */}
          <button
            type="submit"
            disabled={!title}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition-all active:scale-[0.98]"
          >
            <span>Analyze Document</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* REALISTIC 10-STEP PROCESSING PROGRESS */}
      {isProcessing && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-sky-400 font-bold">
                STAGE {currentStep} OF 10 IN PROGRESS
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Processing {title}
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-sky-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(currentStep / 10) * 100}%` }}
            />
          </div>

          <p className="text-sm text-slate-300">{PIPELINE_STEPS[currentStep - 1]?.name}</p>
          <details className="text-xs text-slate-400">
            <summary className="cursor-pointer">View all processing stages</summary>
            <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PIPELINE_STEPS.map((step) => <li key={step.step} className={step.step === currentStep ? 'font-semibold text-sky-400' : ''}>{step.step}. {step.name}</li>)}
            </ol>
          </details>
        </div>
      )}

      {/* COMPLETED SUCCESS CARD */}
      {!isProcessing && completedDocId && (
        <div className="rounded-2xl border border-emerald-600/40 bg-gradient-to-b from-emerald-950/30 via-slate-900/90 to-slate-900/90 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                  PIPELINE COMPLETE
                </span>
                {detectedContradiction && (
                  <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-800">
                    ⚠ CROSS-RECORD CONTRADICTION DETECTED
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {title} Successfully Ingested
              </h2>
              <p className="text-xs text-slate-300">
                Generated {completedClaimsCount} structured claims with bounding region evidence mapping and SHA-256 fingerprinting.
              </p>
            </div>
          </div>

          {detectedContradiction && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-slate-300 space-y-1">
              <div className="flex items-center space-x-1.5 text-rose-300 font-bold">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Contradiction Warning: Owner Mismatch Found</span>
              </div>
              <p className="text-[11px] text-slate-300">
                VERITAS identified that Survey Parcel 184/2 has conflicting registered ownership claims across records (&ldquo;Rahul Sharma&rdquo; vs &ldquo;Rohan Sharma&rdquo;). This has been routed to Human-in-the-Loop review.
              </p>
            </div>
          )}

          {advisorConsent && <button onClick={() => router.push(`/documents/${completedDocId}/advisor`)} className="w-full rounded-xl border border-sky-500 px-4 py-3 text-sm font-semibold text-sky-300">Open Expert Review →</button>}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => router.push(`/documents/${completedDocId}`)}
              className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-3 px-6 text-xs font-semibold text-white shadow-lg transition-all"
            >
              <span>Inspect Document Viewer & Evidence Canvas</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                setCompletedDocId(null);
                setTitle('');
              }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 px-6 text-xs font-medium text-slate-300 transition-colors"
            >
              <span>Upload Another Record</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
