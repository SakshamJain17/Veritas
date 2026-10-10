'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation?.type !== 'reload') return;
    history.scrollRestoration = 'manual';

    if (window.location.hash) {
      history.replaceState(history.state, '', window.location.pathname + window.location.search);
    }
    const scrollToTop = () => window.scrollTo(0, 0);
    scrollToTop();
    const frame = requestAnimationFrame(() => requestAnimationFrame(scrollToTop));
    const timer = window.setTimeout(scrollToTop, 250);
    window.addEventListener('pageshow', scrollToTop);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener('pageshow', scrollToTop);
    };
  }, []);
  if (pathname === '/') return <>{children}</>;
  return <div className="workspace-shell"><Navbar /><main className="workspace-main">{children}</main><Footer /></div>;
}
