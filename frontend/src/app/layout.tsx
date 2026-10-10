import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "VERITAS | Proof of Reality",
  description: "Don't trust the document. Verify the claim. Evidence-backed AI and tamper-evident blockchain provenance for messy public records.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#050608] text-slate-100 selection:bg-blue-300 selection:text-slate-900 font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
