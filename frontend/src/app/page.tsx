'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, Check, FileSearch, Fingerprint, GitCompareArrows, LockKeyhole, RotateCcw, ShieldCheck, UploadCloud } from 'lucide-react';

const capabilities = [
  { icon: FileSearch, title: 'Evidence in context', description: 'Trace each structured claim to its selected source region and text.' },
  { icon: GitCompareArrows, title: 'Conflicts surfaced', description: 'Compare records and route disagreements for human review.' },
  { icon: Fingerprint, title: 'Integrity recorded', description: 'Inspect SHA-256 fingerprints and simulated provenance anchors.' },
];

export default function LandingPage() {
  const [preview, setPreview] = useState<'overview' | 'evidence' | 'review'>('overview');
  const [motionKey, setMotionKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sequence = window.setInterval(() => {
      setPreview((current) => current === 'overview' ? 'evidence' : current === 'evidence' ? 'review' : 'overview');
    }, 4400);
    return () => window.clearInterval(sequence);
  }, [isPlaying, motionKey]);

  const selectPreview = (next: 'overview' | 'evidence' | 'review') => {
    setIsPlaying(false);
    setPreview(next);
  };

  const replayMotion = () => {
    setPreview('overview');
    setIsPlaying(true);
    setMotionKey((key) => key + 1);
  };

  return (
    <div className="product-landing">
      <header className="product-header">
        <Link href="/" className="product-wordmark" aria-label="VERITAS home"><ShieldCheck size={23} strokeWidth={1.8} /> VERITAS</Link>
        <nav aria-label="Main navigation"><Link href="/dashboard">Platform</Link><Link href="/documents">Documents</Link><Link href="/claims">Claims</Link><Link href="/verify">Verify</Link></nav>
        <Link href="/upload" className="product-header-action">Open app <ArrowRight size={15} /></Link>
      </header>

      <main>
        <section className="product-hero">
          <div className="product-hero-copy">
            <span className="product-eyebrow">DOCUMENT INTELLIGENCE · CLAIM VERIFICATION</span>
            <h1>Know what the<br /><span>record proves.</span></h1>
            <p>Upload public records, examine the evidence behind each claim, and surface contradictions before anyone relies on the result.</p>
            <div className="product-actions">
              <Link href="/upload" className="product-primary"><UploadCloud size={17} /> Upload a document <ArrowRight size={17} /></Link>
              <Link href="/dashboard" className="product-secondary">Explore dashboard <ArrowRight size={16} /></Link>
            </div>
            <div className="product-trust"><span><Check size={13} /> Claim-level evidence</span><span><Check size={13} /> Human review</span><span><Check size={13} /> Selective disclosure</span></div>
          </div>

          <div className="macbook-stage" key={motionKey}>
            <div className="macbook-glow" aria-hidden="true" />
            <div className="macbook-device macbook-photo-device">
              <Image src="/macbook-pro-render.png" alt="Space black laptop showing VERITAS" fill priority sizes="(max-width: 700px) 94vw, 700px" className="macbook-photo" />
              <div className="macbook-photo-screen">
                  <div className="device-app" aria-label="VERITAS interactive product preview">
                    <div className="device-app-topbar"><span className="device-app-brand"><ShieldCheck size={15} /> VERITAS</span><span className="device-app-topbar-right"><span className="device-app-status-dot" /> Workspace preview <span className="device-app-avatar">V</span></span></div>
                    <div className="device-app-body">
                      <aside className="device-app-sidebar" aria-label="Preview sections">
                        <span className="device-app-sidebar-label">WORKSPACE</span>
                        {(['overview', 'evidence', 'review'] as const).map((item) => <button key={item} type="button" onClick={() => selectPreview(item)} aria-pressed={preview === item} className={preview === item ? 'active' : ''}>{item === 'overview' ? 'Overview' : item === 'evidence' ? 'Evidence' : 'Review'}</button>)}
                        <span className="device-app-sidebar-bottom">SECURE DEMO</span>
                      </aside>
                      <div className="device-app-content" key={preview}>
                        <div className="device-app-heading"><div><span className="device-app-overline">DOCUMENT INTELLIGENCE / {preview.toUpperCase()}</span><h2>{preview === 'overview' ? 'A clearer view of every record.' : preview === 'evidence' ? 'Evidence, connected.' : 'Resolve what matters.'}</h2><p>{preview === 'overview' ? 'The essentials of your document review, at a glance.' : preview === 'evidence' ? 'Follow a claim from the source text to its verification.' : 'See conflicting facts before approving a result.'}</p></div><Link href={preview === 'overview' ? '/dashboard' : preview === 'evidence' ? '/evidence' : '/claims'}>Open workspace <ArrowRight size={12} /></Link></div>
                        {preview === 'overview' ? <div className="device-app-preview-grid"><div className="device-app-stat"><span>Documents</span><strong>1,284</strong><small>Processed records</small></div><div className="device-app-stat"><span>Verified claims</span><strong>8,421</strong><small>Linked to evidence</small></div><div className="device-app-stat device-app-stat-alert"><span>Needs review</span><strong>37</strong><small>Conflicts surfaced</small></div><div className="device-app-record"><div><span className="device-app-record-icon"><FileSearch size={16} /></span><span><strong>Land Certificate #LC-1842</strong><small>5 claims · evidence mapped</small></span></div><span className="device-app-badge">VERIFIED</span></div></div> : preview === 'evidence' ? <div className="device-app-evidence"><div className="device-app-document"><span>LAND CERTIFICATE · PAGE 2</span><div className="device-app-doc-line" /><div className="device-app-doc-line short" /><div className="device-app-highlight">Registered owner: Rahul Sharma</div><div className="device-app-doc-line" /><div className="device-app-doc-line medium" /></div><div className="device-app-linkline" /><div className="device-app-claim"><span>EXTRACTED CLAIM</span><strong>Rahul Sharma</strong><small>Owner of Survey Parcel 184/2</small><em>Source region linked</em></div></div> : <div className="device-app-review"><div className="device-app-review-title"><GitCompareArrows size={17} /><span>Owner claim requires review</span><small>2 sources</small></div><div className="device-app-review-sources"><div><span>Land Certificate</span><strong>Rahul Sharma</strong></div><div><span>Mutation Extract</span><strong>Rohan Sharma</strong></div></div><p>Conflicting names are presented side by side for a human decision.</p></div>}
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            <div className="macbook-controls"><button type="button" onClick={replayMotion} aria-label="Replay MacBook motion"><RotateCcw size={13} /> Replay motion</button><span>Explore the preview, or <Link href="/dashboard">open the full workspace <ArrowRight size={13} /></Link></span></div>
          </div>
          <a href="#product-details" className="product-scroll" aria-label="Scroll to platform details"><ArrowDown size={16} /></a>
        </section>

        <section id="product-details" className="product-details">
          <div className="product-details-heading"><span className="product-eyebrow">THE PLATFORM</span><h2>Every claim has a story.<br /><span>See the evidence.</span></h2><p>VERITAS connects a document, its extracted claims, the supporting source region, and any conflicting records in one review workflow.</p></div>
          <div className="product-capabilities">{capabilities.map(({ icon: Icon, title, description }) => <div className="product-capability" key={title}><div className="product-capability-icon"><Icon size={23} strokeWidth={1.7} /></div><h3>{title}</h3><p>{description}</p></div>)}</div>
          <div className="product-privacy"><LockKeyhole size={18} /><p>Demo mode hashes uploads and discards the file bytes. Public verification reveals a selected evidence snippet, while blockchain anchors are simulated.</p><Link href="/verify">View verification <ArrowRight size={16} /></Link></div>
        </section>
      </main>
    </div>
  );
}
