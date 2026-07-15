"use client";

import type { BlogPost } from "../types";

interface BlogPostPageProps {
  post: BlogPost;
  /** Back link href (default: "/blog") */
  backHref?: string;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * Format a date string for display.
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Generate share URLs for common platforms.
 */
function getShareLinks(post: BlogPost) {
  const url = encodeURIComponent(post.externalUrl ?? "");
  const title = encodeURIComponent(post.title);
  return {
    twitter: `https://x.com/intent/tweet?text=${title}&url=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    email: `mailto:?subject=${title}&body=Check out this post: ${url}`,
    copy: post.externalUrl ?? "",
  };
}

/**
 * Client component for rendering a single blog post with typography,
 * responsive images, author attribution, and share links.
 *
 * For Substack-sourced posts, this renders a preview card that links
 * to the full external article since the full HTML content is not
 * available via RSS summary.
 */
export function BlogPostPage({
  post,
  backHref = "/blog",
  className = "",
}: BlogPostPageProps) {
  const shares = getShareLinks(post);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shares.copy);
    } catch {
      // Clipboard API not available — fail silently
    }
  };

  return (
    <article className={`sa9-blog-post mx-auto max-w-3xl px-6 py-16 sm:py-20 ${className}`}>
      {/* Back navigation */}
      <a
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-mono opacity-60 hover:opacity-100 transition-opacity mb-8"
      >
        &larr; Back to Dispatches
      </a>

      {/* Post header */}
      <header className="mb-8">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm opacity-60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm font-mono opacity-60">
          {post.author && <span>By {post.author}</span>}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.readTime && <span>{post.readTime}</span>}
        </div>
      </header>

      {/* Featured image */}
      {post.image && (
        <div className="mb-8 overflow-hidden rounded-sm">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto max-h-[480px] object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* Description / excerpt */}
      <div className="prose prose-invert max-w-none mb-8">
        <p className="text-lg leading-relaxed opacity-80">{post.description}</p>
      </div>

      {/* Read full article CTA (for external/Substack posts) */}
      {post.externalUrl && (
        <div className="border rounded-sm p-6 mb-8">
          <p className="text-sm opacity-70 mb-3">
            This dispatch is published on Substack. Read the full article there.
          </p>
          <a
            href={post.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-mono text-sm font-semibold hover:underline"
          >
            Read Full Dispatch on Substack &rarr;
          </a>
        </div>
      )}

      {/* Share links */}
      <footer className="border-t pt-6 mt-12">
        <p className="text-xs font-mono uppercase tracking-widest opacity-50 mb-3">
          Share This Dispatch
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={shares.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono px-3 py-1.5 border rounded-sm hover:opacity-80 transition-opacity"
          >
            X / Twitter
          </a>
          <a
            href={shares.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono px-3 py-1.5 border rounded-sm hover:opacity-80 transition-opacity"
          >
            LinkedIn
          </a>
          <a
            href={shares.email}
            className="text-sm font-mono px-3 py-1.5 border rounded-sm hover:opacity-80 transition-opacity"
          >
            Email
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-sm font-mono px-3 py-1.5 border rounded-sm hover:opacity-80 transition-opacity cursor-pointer"
          >
            Copy Link
          </button>
        </div>
      </footer>
    </article>
  );
}
