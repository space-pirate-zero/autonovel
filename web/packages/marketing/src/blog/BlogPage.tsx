import type { DesignSystem } from "../types";
import { fetchBlogPosts, SPZ_FEED_URL, BLOG_REVALIDATE } from "./rss-fetcher";
import { BlogLayout } from "./BlogLayout";

export { BLOG_REVALIDATE };

interface BlogPageProps {
  /** RSS feed URL. Defaults to SPZ Substack. */
  feedUrl?: string;
  /** Site/product name shown in the heading area. */
  siteTitle?: string;
  /** Design system key for theming context. */
  designSystem?: DesignSystem;
  /** Maximum number of posts to display. */
  limit?: number;
  /** Optional description below the title. */
  description?: string;
  /** Optional className for the wrapper. */
  className?: string;
}

/**
 * Server component that fetches RSS posts and renders a blog listing.
 *
 * Drop this into any Next.js page.tsx as an async server component.
 * Data is fetched at build/request time with ISR revalidation (1 hour).
 *
 * @example
 * ```tsx
 * // app/blog/page.tsx
 * import { BlogPage, BLOG_REVALIDATE } from "@sa9/marketing/blog";
 * export const revalidate = BLOG_REVALIDATE;
 * export default function Blog() {
 *   return <BlogPage siteTitle="TradeCraft" designSystem="neon" />;
 * }
 * ```
 */
export async function BlogPage({
  feedUrl = SPZ_FEED_URL,
  siteTitle,
  designSystem = "neon",
  limit = 20,
  description,
  className = "",
}: BlogPageProps) {
  const posts = await fetchBlogPosts(feedUrl, limit);

  const title = siteTitle ? `${siteTitle} Dispatches` : "Dispatches";
  const desc =
    description ??
    "Investigative AI writing, cybersecurity deep-dives, and dispatches from the outer edge. Powered by the SPZ Substack.";

  // Design system accent mapping for subtle theming
  const accentMap: Record<DesignSystem, string> = {
    neon: "sa9-pink",
    phosphor: "sa9-green",
    stealth: "sa9-text",
    leopard: "sa9-pink",
    cathode: "sa9-amber",
  };

  const accent = accentMap[designSystem];

  return (
    <div className={`sa9-blog-page ${className}`} data-design-system={designSystem}>
      {/* Hero banner */}
      <section className="relative border-b border-current/10 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className={`text-xs font-mono uppercase tracking-widest text-${accent} mb-3`}>
            Substack Transmissions
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-lg opacity-70 max-w-2xl">{desc}</p>
          <a
            href="https://spacepiratezero.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block mt-6 text-sm font-mono text-${accent} hover:underline`}
          >
            Subscribe on Substack &rarr;
          </a>
        </div>
      </section>

      {/* Post grid via shared BlogLayout */}
      <BlogLayout
        title=""
        posts={posts}
        className="py-12"
      />
    </div>
  );
}
