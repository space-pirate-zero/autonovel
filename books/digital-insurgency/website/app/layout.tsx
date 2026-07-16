import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import show from "@/content/show.json";

const orbitron = localFont({
  src: [
    { path: "./fonts/Orbitron-700.ttf", weight: "700" },
    { path: "./fonts/Orbitron-900.ttf", weight: "900" },
  ],
  variable: "--font-display",
  display: "swap",
});
const grotesk = localFont({
  src: [
    { path: "./fonts/SpaceGrotesk-400.ttf", weight: "400" },
    { path: "./fonts/SpaceGrotesk-700.ttf", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});
const jbmono = localFont({
  src: [{ path: "./fonts/JetBrainsMono-400.ttf", weight: "400" }],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://digital-insurgency.com"),
  title: "Digital Insurgency — the field course",
  description: show.subtitle,
  openGraph: { images: ["/art/site/08_og-card.png"] },
};

const NAV = [
  { href: "/read", label: "Read" },
  { href: "/glasshouse", label: "The Glass House" },
  { href: "/dossier", label: "Dossier" },
  { href: "/badge", label: "Get Certified" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${grotesk.variable} ${jbmono.variable}`}>
      <body>
        <header className="sticky top-0 z-50 border-b border-line bg-void/85 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="font-display text-lg font-black tracking-wide">
              <span className="neon-pink">DIGITAL</span>{" "}
              <span className="neon-cyan">INSURGENCY</span>
            </Link>
            <div className="flex items-center gap-5 text-sm">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="text-mut hover:text-ink">
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-5">{children}</main>
        <footer className="mx-auto mt-24 max-w-6xl border-t border-line px-5 py-10 text-sm text-mut">
          <p className="font-mono">
            <span className="neon-cyan">Digital Insurgency</span> — a field course by Space
            Pirate Zero. Signal finds signal.
          </p>
          <p className="mt-2">
            This site practices what it teaches: no dark patterns, no manufactured scarcity.{" "}
            <Link href="/glasshouse" className="text-cyan hover:underline">
              Run the Mirror Test on it.
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
