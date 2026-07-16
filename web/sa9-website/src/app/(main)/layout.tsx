import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PeekingCaptain } from "@/components/CaptainFace";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd()),
        }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-sa9-pink focus:text-sa9-surface focus:font-mono focus:text-sm focus:border-3 focus:border-sa9-pink focus:shadow-[4px_4px_0_#990044]"
      >
        Skip to content
      </a>
      <PeekingCaptain />
      <Header />
      <main id="main-content" className="relative z-10 flex-1">
        {children}
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}
