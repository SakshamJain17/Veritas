import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return <footer className="workspace-footer"><div><span><ShieldCheck size={16} /> VERITAS</span><p>Evidence-backed document review and claim verification.</p></div><nav aria-label="Footer navigation"><Link href="/issuers">Issuers</Link><Link href="/verify">Public verification</Link><Link href="/settings">Settings</Link></nav><small>Demo extraction · Simulated anchors</small></footer>;
}
