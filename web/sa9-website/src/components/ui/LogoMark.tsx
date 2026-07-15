/**
 * SA9 logomark — a compact neon flying-saucer glyph, on-brand (pink hull rim,
 * cyan dome + beam, pink antenna orb). Scales cleanly; uses brand tokens.
 */
export function LogoMark({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      {/* antenna + orb */}
      <line x1="27" y1="12" x2="30.5" y2="7" stroke="var(--color-sa9-cyan)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="31" cy="6.2" r="2.4" fill="var(--color-sa9-pink)" opacity="0.9" />
      <circle cx="31" cy="6.2" r="4" fill="none" stroke="var(--color-sa9-pink)" strokeWidth="1" opacity="0.5" />
      {/* dome */}
      <path
        d="M12 20a8 6 0 0116 0"
        fill="none"
        stroke="var(--color-sa9-cyan)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M14.5 18.5c1-2 3-3 5.5-3" fill="none" stroke="var(--color-sa9-cyan)" strokeWidth="1" opacity="0.7" strokeLinecap="round" />
      {/* hull */}
      <ellipse cx="20" cy="21.5" rx="15" ry="5" fill="none" stroke="var(--color-sa9-pink)" strokeWidth="2.2" />
      <ellipse cx="20" cy="21.5" rx="9.5" ry="2.4" fill="none" stroke="var(--color-sa9-pink)" strokeWidth="1.2" opacity="0.7" />
      {/* beam */}
      <path d="M15.5 25.5L12 34h16l-3.5-8.5z" fill="var(--color-sa9-cyan)" opacity="0.18" />
      <path d="M15.5 25.5L12 34M24.5 25.5L28 34" stroke="var(--color-sa9-cyan)" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}
