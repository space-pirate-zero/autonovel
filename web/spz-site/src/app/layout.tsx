import { Orbitron, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { sa9ClerkAppearance } from "@sa9/auth/provider";
import { hasValidClerkKey } from "@sa9/auth/middleware";
import { SPZHeader } from "@/components/layout/SPZHeader";
import { SPZFooter } from "@/components/layout/SPZFooter";
import { Suspense } from "react";
import { SA9Analytics } from "@sa9/analytics/provider";
import { CelShadeFilter } from "@/components/layout/CelShadeFilter";
import { SPZ_META } from "@sa9/marketing/seo";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["700", "800", "900"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const OG_IMAGE =
  "https://www.spacepiratezero.com/api/og?title=Space+Pirate+Zero&subtitle=Digital+Insurgent+at+Large";

export const metadata = SPZ_META;

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://spaceshipalpha9.co/#organization",
      name: "Spaceship Alpha 9",
      url: "https://spaceshipalpha9.co",
      foundingDate: "2024",
    },
    {
      "@type": "Person",
      "@id": "https://www.spacepiratezero.com/#greg-chambers",
      name: "Greg Chambers",
      alternateName: "Space Pirate Zero",
      url: "https://www.spacepiratezero.com",
      sameAs: [
        "https://spaceshipalpha9.co",
        "https://spacepiratezero.substack.com",
        "https://www.linkedin.com/in/gregchambers/",
        "https://github.com/space-pirate-zero",
        "https://www.instagram.com/space_pirate_zero/",
      ],
      jobTitle: "Enterprise AI Strategist, Inventor & Author",
      worksFor: { "@id": "https://spaceshipalpha9.co/#organization" },
      description:
        "Enterprise AI strategist, multi-patent inventor, keynote speaker, music producer, and investigative writer. Captain of Spaceship Alpha 9.",
      image: OG_IMAGE,
    },
    {
      "@type": "WebSite",
      "@id": "https://www.spacepiratezero.com/#website",
      url: "https://www.spacepiratezero.com",
      name: "Space Pirate Zero",
      description:
        "Digital headquarters of Space Pirate Zero — investigative AI writing, music, patents, and enterprise strategy. A Spaceship Alpha 9 property.",
      author: { "@id": "https://www.spacepiratezero.com/#greg-chambers" },
      publisher: { "@id": "https://spaceshipalpha9.co/#organization" },
      inLanguage: "en-US",
    },
  ],
};

function MaybeClerkProvider({ children }: { children: React.ReactNode }) {
  if (hasValidClerkKey()) {
    return (
      <ClerkProvider appearance={sa9ClerkAppearance}>
        {children}
      </ClerkProvider>
    );
  }
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${orbitron.variable} ${spaceGrotesk.variable}`}
    >
      <body className="film-grain scanlines min-h-screen flex flex-col bg-sa9-surface text-sa9-text antialiased font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-sa9-pink focus:text-sa9-surface focus:font-mono focus:text-sm focus:border-3 focus:border-sa9-pink"
        >
          Skip to content
        </a>
        <CelShadeFilter />
        <Suspense fallback={null}>
          <SA9Analytics product="spz" />
        </Suspense>
        <MaybeClerkProvider>
          <SPZHeader />
          <main id="main-content" className="flex-1 pt-16 md:pt-14">
            {children}
          </main>
          <SPZFooter />
        </MaybeClerkProvider>
      </body>
    </html>
  );
}
