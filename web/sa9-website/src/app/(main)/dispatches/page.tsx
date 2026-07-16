import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { dispatches } from "@/lib/dispatches";

export const metadata: Metadata = {
  title: "Dispatches — AI, Cybersecurity & Culture from Space Pirate Zero",
  description:
    "Investigative AI writing, cybersecurity deep-dives, cultural criticism, and gonzo tech journalism from Space Pirate Zero (Greg Chambers). 20 dispatches from the outer edge.",
  alternates: {
    canonical: "/dispatches",
  },
  openGraph: {
    title: "Dispatches from Space Pirate Zero — AI & Culture Writing",
    description:
      "Investigative AI journalism, dark web exposés, cybersecurity analysis, and cultural criticism. Subscribe on Substack.",
    images: [{ url: "/api/og?title=Dispatches&subtitle=AI,+Cybersecurity+%26+Culture+from+Space+Pirate+Zero&type=dispatch", width: 1200, height: 630 }],
  },
};

const sorted = [...dispatches].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

const featured = sorted.slice(0, 3);
const rest = sorted.slice(3);

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DispatchesPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "Dispatches", url: "https://spaceshipalpha9.co/dispatches" },
  ]);

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Dispatches from Space Pirate Zero",
    description: "Investigative AI writing, cybersecurity deep-dives, and cultural criticism from Greg Chambers.",
    url: "https://spaceshipalpha9.co/dispatches",
    author: {
      "@type": "Person",
      name: "Greg Chambers",
      alternateName: "Space Pirate Zero",
    },
    publisher: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
      url: "https://spaceshipalpha9.co",
    },
    blogPost: sorted.slice(0, 10).map((d) => ({
      "@type": "BlogPosting",
      headline: d.title,
      description: d.description,
      url: `https://spaceshipalpha9.co/dispatches/${d.slug}`,
      datePublished: d.date,
      author: { "@type": "Person", name: d.author ?? "Greg Chambers" },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      {/* ══ HERO ══ */}
      <section className="relative border-b-3 border-sa9-border overflow-hidden">
        <div className="absolute inset-0 data-grid-bg" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <Badge variant="pink" className="mb-4">
            SUBSTACK TRANSMISSIONS
          </Badge>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sa9-text mb-4 leading-[0.9]">
            Dispatches from
            <br />
            <span className="text-sa9-pink">the Outer Edge.</span>
          </h1>
          <p className="text-sa9-text-muted text-lg max-w-2xl mb-6">
            {dispatches.length} dispatches on AI, cybersecurity, dark web
            investigations, cultural criticism, and the occasional leg of lamb.
            Written by Space Pirate Zero.
          </p>
          <a
            href="https://spacepiratezero.substack.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary" size="lg">
              SUBSCRIBE ON SUBSTACK
            </Button>
          </a>
        </div>
      </section>

      {/* ══ FEATURED ══ */}
      <AnimatedSection className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-1 h-12 bg-sa9-pink flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
                Latest Dispatches
              </h2>
              <p className="text-sa9-text-muted text-sm mt-1">
                The most recent transmissions from the outer edge.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featured.map((dispatch) => (
              <Link
                key={dispatch.id}
                href={`/dispatches/${dispatch.slug}`}
                className="group border-3 border-sa9-border bg-sa9-surface-raised hover:border-sa9-pink transition-all duration-150 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0_#990044] flex flex-col"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={dispatch.image}
                    alt={dispatch.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {dispatch.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono uppercase tracking-widest text-sa9-text-dim border border-sa9-border px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display font-bold text-lg text-sa9-text group-hover:text-sa9-pink transition-colors mb-2">
                    {dispatch.title}
                  </h3>
                  <p className="text-sa9-text-muted text-sm leading-relaxed flex-1">
                    {dispatch.summary}
                  </p>
                  <div className="font-mono text-xs text-sa9-text-dim mt-4">
                    {formatDate(dispatch.date)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ ALL DISPATCHES ══ */}
      <AnimatedSection className="border-y-3 border-sa9-border bg-sa9-surface-raised py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-1 h-12 bg-sa9-cyan flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
                Archive
                <span className="font-mono text-xs text-sa9-text-dim ml-3">
                  ({rest.length})
                </span>
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {rest.map((dispatch) => (
              <Link
                key={dispatch.id}
                href={`/dispatches/${dispatch.slug}`}
                className="group flex items-start gap-6 border-3 border-sa9-border bg-sa9-surface hover:border-sa9-pink p-6 transition-all duration-150 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0_#990044]"
              >
                <div className="hidden sm:block relative w-24 h-24 flex-shrink-0 overflow-hidden">
                  <Image
                    src={dispatch.image}
                    alt={dispatch.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {dispatch.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono uppercase tracking-widest text-sa9-text-dim border border-sa9-border px-1 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="font-mono text-[10px] text-sa9-text-dim">
                      {formatDate(dispatch.date)}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sa9-text group-hover:text-sa9-pink transition-colors mb-1 truncate">
                    {dispatch.title}
                  </h3>
                  <p className="text-sa9-text-muted text-sm leading-relaxed line-clamp-2">
                    {dispatch.description}
                  </p>
                </div>
                <span className="hidden sm:block text-sa9-text-dim group-hover:text-sa9-pink transition-colors text-lg flex-shrink-0">
                  &#x2192;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ CTA ══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text mb-4">
            Never miss a <span className="text-sa9-pink">dispatch</span>.
          </h2>
          <p className="text-sa9-text-muted text-lg mb-8">
            Subscribe on Substack for AI insights, investigations, and
            dispatches from the outer edge.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://spacepiratezero.substack.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="lg">
                SUBSCRIBE TO DISPATCHES
              </Button>
            </a>
            <Link href="/">
              <Button variant="secondary" size="lg">
                BACK TO HOME
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
