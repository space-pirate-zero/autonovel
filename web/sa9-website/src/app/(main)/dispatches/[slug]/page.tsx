import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { dispatches } from "@/lib/dispatches";
import { breadcrumbJsonLd, articleJsonLd } from "@/lib/structured-data";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  params: Promise<{ slug: string }>;
}

function getDispatch(slug: string) {
  return dispatches.find((d) => d.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return dispatches.map((d) => ({ slug: d.slug }));
}

const BASE_URL = "https://spaceshipalpha9.co";
function ogImageForDispatch(dispatch: { title: string; image?: string }): string {
  // Use article image if it's a real image (not a placeholder)
  if (dispatch.image && dispatch.image.startsWith("http") && !dispatch.image.includes("picsum.photos")) {
    return dispatch.image;
  }
  // Generate dynamic OG image
  return `${BASE_URL}/api/og?title=${encodeURIComponent(dispatch.title)}&type=dispatch`;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dispatch = getDispatch(slug);
  if (!dispatch) return {};

  const title = `${dispatch.title} — Space Pirate Zero`;
  const description = dispatch.description || dispatch.summary;
  const ogImage = ogImageForDispatch(dispatch);

  return {
    title,
    description,
    keywords: dispatch.seoKeywords,
    authors: [{ name: dispatch.author ?? "Greg Chambers" }],
    alternates: {
      canonical: `${BASE_URL}/dispatches/${dispatch.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: dispatch.date,
      authors: [dispatch.author ?? "Greg Chambers"],
      images: [{ url: ogImage, width: 1200, height: 630, alt: dispatch.title }],
      tags: dispatch.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DispatchPage({ params }: Props) {
  const { slug } = await params;
  const dispatch = getDispatch(slug);
  if (!dispatch) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "Dispatches", url: "https://spaceshipalpha9.co/dispatches" },
    {
      name: dispatch.title,
      url: `https://spaceshipalpha9.co/dispatches/${dispatch.slug}`,
    },
  ]);

  const article = articleJsonLd({
    title: dispatch.title,
    slug: dispatch.slug,
    description: dispatch.description,
    image: dispatch.image,
    date: dispatch.date,
    author: dispatch.author ?? "Greg Chambers",
    keywords: dispatch.seoKeywords,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />

      {/* ── HERO ── */}
      <section className="relative border-b-3 border-sa9-border overflow-hidden">
        <div className="absolute inset-0 data-grid-bg" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
          {/* Back link */}
          <Link
            href="/dispatches"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-sa9-text-dim hover:text-sa9-pink transition-colors mb-8"
          >
            ← All Dispatches
          </Link>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {dispatch.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="pink">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-sa9-text leading-[0.95] mb-6">
            {dispatch.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-sa9-text-dim">
            <span>{formatDate(dispatch.date)}</span>
            {dispatch.readingTime && (
              <span>{dispatch.readingTime} min read</span>
            )}
            <span>By {dispatch.author ?? "Greg Chambers"}</span>
          </div>
        </div>
      </section>

      {/* ── FEATURED IMAGE ── */}
      {dispatch.image && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-0 pt-10">
          <div className="relative w-full aspect-[16/9] overflow-hidden border-3 border-sa9-border shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
            <Image
              src={dispatch.image}
              alt={dispatch.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        </div>
      )}

      {/* ── ARTICLE BODY ── */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {dispatch.htmlContent ? (
          /* Full article from Substack RSS */
          <div
            className="dispatch-prose"
            dangerouslySetInnerHTML={{ __html: dispatch.htmlContent }}
          />
        ) : (
          /* No full content yet — show summary + CTA to read on Substack */
          <div className="space-y-6">
            <p className="text-sa9-text text-lg leading-relaxed">
              {dispatch.summary}
            </p>
            <div className="border-l-4 border-sa9-pink pl-6 py-2">
              <p className="text-sa9-text-muted text-sm">
                Full article available on Substack. Run{" "}
                <code className="font-mono text-sa9-pink bg-sa9-surface-raised px-1">
                  make content-fetch
                </code>{" "}
                to pull the complete content into this site.
              </p>
            </div>
          </div>
        )}
      </article>

      {/* ── CTA ── */}
      <section className="border-t-3 border-sa9-border bg-sa9-surface-raised py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-sa9-text-dim mb-1">
              Read the original
            </p>
            <p className="text-sa9-text-muted text-sm">
              Subscribe on Substack for new dispatches from the outer edge.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={dispatch.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="sm">
                READ ON SUBSTACK ↗
              </Button>
            </a>
            <Link href="/dispatches">
              <Button variant="secondary" size="sm">
                ALL DISPATCHES
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
