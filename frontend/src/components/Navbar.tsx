'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Building2, FileText, LayoutDashboard, Menu, Network, ScanSearch, Settings, ShieldCheck, UploadCloud, X } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/claims', label: 'Claims', icon: ScanSearch },
  { href: '/evidence', label: 'Evidence', icon: Network },
  { href: '/audit', label: 'Audit', icon: ShieldCheck },
  { href: '/issuers', label: 'Issuers', icon: Building2 },
  { href: '/verify', label: 'Verify', icon: ArrowUpRight },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return <header className="workspace-header">
    <div className="workspace-header-inner">
      <Link href="/" className="workspace-logo"><span className="workspace-logo-mark"><ShieldCheck size={19} strokeWidth={1.7} /></span><span><strong>VERITAS</strong><small>Proof of Reality</small></span></Link>
      <nav className="workspace-nav" aria-label="Workspace navigation">{links.map(({ href, label }) => <Link key={href} href={href} className={active(href) ? 'active' : ''}>{label}</Link>)}</nav>
      <div className="workspace-actions"><span className="workspace-mode"><i /> Demo mode</span><Link href="/upload" className="workspace-upload"><UploadCloud size={15} /> Upload record</Link><Link href="/settings" className="workspace-settings" aria-label="Settings"><Settings size={17} /></Link></div>
      <button className="workspace-menu-button" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    {open && <nav className="workspace-mobile-nav" aria-label="Mobile workspace navigation">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)}><Icon size={17} />{label}</Link>)}<Link href="/settings" onClick={() => setOpen(false)}><Settings size={17} />Settings</Link></nav>}
  </header>;
}
