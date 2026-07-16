import type { BlogPost } from "../types";

interface BlogCardProps {
  post: BlogPost;
  baseUrl?: string;
  className?: string;
}

/**
 * Blog post preview card for dispatch/blog listings.
 */
export function BlogCard({ post, baseUrl = "", className = "" }: BlogCardProps) {
  const href = post.externalUrl ?? `${baseUrl}/dispatches/${post.slug}`;
  const isExternal = !!post.externalUrl;

  return (
    <article className={`sa9-blog-card group border rounded-sm p-6 transition-all hover:translate-y-[-2px] ${className}`}>
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {post.image && (
          <div className="sa9-blog-card-image mb-4 overflow-hidden rounded-sm">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <div className="sa9-blog-card-meta flex items-center gap-3 mb-3">
          <time className="text-xs font-mono opacity-50">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          {post.readTime && (
            <span className="text-xs font-mono opacity-50">{post.readTime}</span>
          )}
        </div>
        <h3 className="sa9-blog-card-title font-bold text-lg leading-tight mb-2 group-hover:opacity-80 transition-opacity">
          {post.title}
        </h3>
        <p className="sa9-blog-card-description text-sm opacity-70 leading-relaxed line-clamp-3">
          {post.description}
        </p>
        {post.tags.length > 0 && (
          <div className="sa9-blog-card-tags flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-2 py-0.5 rounded-sm opacity-60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </a>
    </article>
  );
}
