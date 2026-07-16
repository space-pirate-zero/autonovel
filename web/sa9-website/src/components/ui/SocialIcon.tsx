import type { ReactNode } from "react";

/**
 * SA9 house-style social/link glyphs. Each platform stays recognizable, but is
 * redrawn in one unified NEON language: chunky 2.4px strokes, hard geometry,
 * squared terminals, and a consistent 24px optical weight so the row reads as a
 * single SA9 HUD set rather than a pile of borrowed third-party logos. Renders
 * in `currentColor` so it inherits the neon pink/cyan of its chip.
 */
export type IconName =
  | "substack"
  | "github"
  | "linkedin"
  | "instagram"
  | "bluesky"
  | "x"
  | "spotify"
  | "applePodcasts"
  | "amazon"
  | "kindle"
  | "globe";

const SW = 2.4; // shared stroke weight — the SA9 house line

const paths: Record<IconName, ReactNode> = {
  substack: (
    <>
      <rect x="4" y="4.5" width="16" height="2.8" fill="currentColor" />
      <rect x="4" y="9.6" width="16" height="2.8" fill="currentColor" />
      <path d="M4 14.8v5.2l8-3 8 3v-5.2H4z" fill="currentColor" />
    </>
  ),
  github: (
    <path
      d="M12 3a9 9 0 00-2.85 17.54c.45.08.62-.2.62-.43v-1.5c-2.5.55-3.03-1.2-3.03-1.2-.41-1.04-1-1.32-1-1.32-.82-.56.06-.55.06-.55.9.07 1.38.94 1.38.94.8 1.38 2.1.98 2.62.75.08-.58.31-.98.57-1.2-2-.23-4.1-1-4.1-4.45 0-.98.35-1.79.94-2.42-.1-.23-.41-1.15.09-2.4 0 0 .76-.25 2.5.92a8.6 8.6 0 014.55 0c1.74-1.17 2.5-.92 2.5-.92.5 1.25.19 2.17.09 2.4.59.63.94 1.44.94 2.42 0 3.46-2.1 4.22-4.11 4.44.32.28.61.83.61 1.68v2.49c0 .24.16.52.62.43A9 9 0 0012 3z"
      fill="currentColor"
    />
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={SW} />
      <rect x="6" y="10" width="2.8" height="7" fill="currentColor" />
      <circle cx="7.4" cy="7" r="1.5" fill="currentColor" />
      <path d="M11 17v-7h2.6v1a2.7 2.7 0 014.6 2V17h-2.6v-3.6c0-.9-.4-1.5-1.2-1.5-.7 0-1.4.5-1.4 1.5V17H11z" fill="currentColor" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" strokeWidth={SW} />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth={SW} />
      <circle cx="16.7" cy="7.3" r="1.3" fill="currentColor" />
    </>
  ),
  bluesky: (
    <path
      d="M12 10.5C10.5 7.8 7 5.5 5 5.5c-1.8 0-2.2 1.6-1.6 4 .3 1.2.9 3 1.4 3.8.7 1.1 1.9 1.3 3.1 1-2 .4-2.7 1.6-1.8 3 1 1.5 2.7.7 3.9-1.3.5-.8.9-1.7 1-2 .1.3.5 1.2 1 2 1.2 2 2.9 2.8 3.9 1.3.9-1.4.2-2.6-1.8-3 1.2.3 2.4.1 3.1-1 .5-.8 1.1-2.6 1.4-3.8.6-2.4.2-4-1.6-4-2 0-5.5 2.3-7 5z"
      fill="currentColor"
    />
  ),
  x: (
    <path d="M4 4l6.5 8.5L4.4 20H7l4.6-5.5L15.7 20H20l-6.8-8.9L19.6 4H17l-4.2 5-3.9-5H4z" fill="currentColor" />
  ),
  spotify: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={SW} />
      <path d="M7.3 9.4c3-.8 6.5-.4 9 1.2M7.8 12.6c2.5-.6 5.2-.3 7.3.9M8.4 15.4c1.9-.4 4-.2 5.6.8" fill="none" stroke="currentColor" strokeWidth={SW - 0.4} strokeLinecap="round" />
    </>
  ),
  applePodcasts: (
    <>
      <circle cx="12" cy="9.3" r="2.6" fill="currentColor" />
      <path d="M8.2 13.5a5.2 5.2 0 117.6 0" fill="none" stroke="currentColor" strokeWidth={SW} />
      <path d="M10.3 14.6h3.4l-.7 6a1 1 0 01-2 0l-.7-6z" fill="currentColor" />
    </>
  ),
  amazon: (
    <>
      <path d="M5 15.4c4 2.7 10 2.7 13.7-.2" fill="none" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <path d="M17 14.5c.9-.4 2.1-.4 2.5 0 .3.4 0 1.7-.5 2.4" fill="none" stroke="currentColor" strokeWidth={SW - 0.4} strokeLinecap="round" />
      <path d="M8 6.4C8 4.9 9.4 3.9 11.3 3.9c2.1 0 3.1.9 3.1 2.7v3.9c0 .7.2 1.1.6 1.6M11 8.4c-1.9.2-3.1.9-3.1 2.3 0 1 .8 1.6 1.9 1.6 1.4 0 2.5-1 2.5-2.7" fill="none" stroke="currentColor" strokeWidth={SW - 0.4} strokeLinecap="round" />
    </>
  ),
  kindle: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" fill="none" stroke="currentColor" strokeWidth={SW} />
      <line x1="8" y1="7.5" x2="16" y2="7.5" stroke="currentColor" strokeWidth={SW - 0.4} />
      <line x1="8" y1="10.6" x2="16" y2="10.6" stroke="currentColor" strokeWidth={SW - 0.4} />
      <line x1="8" y1="13.7" x2="13" y2="13.7" stroke="currentColor" strokeWidth={SW - 0.4} />
    </>
  ),
  // SA9 saucer mark — used for sister sites, so links to our own ships read as SA9.
  globe: (
    <>
      <ellipse cx="12" cy="12.6" rx="8.5" ry="3.4" fill="none" stroke="currentColor" strokeWidth={SW} />
      <path d="M6 11.4a6 6 0 0112 0" fill="none" stroke="currentColor" strokeWidth={SW} />
      <line x1="12" y1="5.4" x2="12" y2="3.2" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <circle cx="12" cy="2.6" r="1.2" fill="currentColor" />
      <circle cx="9" cy="12.4" r="0.9" fill="currentColor" />
      <circle cx="12" cy="12.9" r="0.9" fill="currentColor" />
      <circle cx="15" cy="12.4" r="0.9" fill="currentColor" />
    </>
  ),
};

export function SocialIcon({
  name,
  className = "w-5 h-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
