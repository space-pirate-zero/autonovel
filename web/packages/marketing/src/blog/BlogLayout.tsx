import type { ReactNode } from "react";
import type { BlogPost } from "../types";
import { BlogCard } from "./BlogCard";

interface BlogLayoutProps {
  title?: string;
  description?: string;
  posts: BlogPost[];
  baseUrl?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Shared blog/dispatches listing layout.
 * Used by all marketing sites with tag-filtered posts.
 */
export function BlogLayout({
  title = "Dispatches",
  description,
  posts,
  baseUrl = "",
  children,
  className = "",
}: BlogLayoutProps) {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className={`sa9-blog py-20 px-6 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="sa9-blog-title text-3xl md:text-4xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="sa9-blog-description mt-4 text-lg opacity-70 max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {children}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((post) => (
            <BlogCard key={post.slug} post={post} baseUrl={baseUrl} />
          ))}
        </div>

        {sorted.length === 0 && (
          <p className="text-center py-12 opacity-50 font-mono text-sm">
            No dispatches yet. Check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
