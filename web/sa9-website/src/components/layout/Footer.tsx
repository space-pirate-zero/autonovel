import Link from "next/link";
import { SocialIcon, type IconName } from "@/components/ui/SocialIcon";
import { LogoMark } from "@/components/ui/LogoMark";

const productLinks = [
  { href: "https://stylelift.fashion", label: "StyleLift", external: true },
  { href: "/sites/ghostdeck", label: "GhostDeck" },
  { href: "/sites/osmix", label: "OSMIX" },
];

const moreProducts = [
  { href: "/sites/darkwave", label: "DARKWAVE" },
  { href: "/sites/tradecraft", label: "TradeCraft" },
  { href: "/sites/brand-casino", label: "Brand Casino" },
];

const studioLinks = [
  { href: "/products", label: "All Products" },
  { href: "/studio", label: "The Studio" },
  { href: "/consulting", label: "Enterprise AI" },
  { href: "/dispatches", label: "Dispatches" },
  { href: "/music", label: "Music" },
  { href: "/press", label: "Press & Patents" },
  { href: "/about", label: "Dossier" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/contact", label: "Contact" },
];

const socialLinks: { label: string; href: string; icon: IconName }[] = [
  { label: "Substack", href: "https://spacepiratezero.substack.com", icon: "substack" },
  { label: "GitHub", href: "https://github.com/space-pirate-zero", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/gregchambers/", icon: "linkedin" },
  { label: "Instagram", href: "https://www.instagram.com/space_pirate_zero/", icon: "instagram" },
  { label: "Bluesky", href: "https://bsky.app/profile/spacepiratezero.bsky.social", icon: "bluesky" },
  { label: "X", href: "https://x.com/SpacePirateZero", icon: "x" },
];

// Where to listen / read the transmissions.
const listenRead: { label: string; href: string; icon: IconName }[] = [
  { label: "Apple Podcasts", href: "https://podcasts.apple.com/us/podcast/the-last-human-ceo/id6790448408", icon: "applePodcasts" },
  { label: "Spotify", href: "https://open.spotify.com/show/033OSpl5KjvWx07upDLZ8M", icon: "spotify" },
  { label: "Kindle", href: "https://www.amazon.com/dp/B0H5YVJY3Z", icon: "kindle" },
  { label: "Amazon", href: "https://www.amazon.com/dp/B0H6LCDJ9H", icon: "amazon" },
];

// Sister sites in the SA9 orbit.
const sisterSites: { label: string; href: string; icon: IconName }[] = [
  { label: "Daniela Chambers", href: "https://danielachambers.com", icon: "globe" },
  { label: "StyleLift", href: "https://stylelift.fashion", icon: "globe" },
  { label: "The Last Human CEO", href: "https://lasthumanceo.com", icon: "globe" },
];

export function Footer() {
  return (
    <footer className="border-t-3 border-sa9-border bg-sa9-surface">
      <div className="neon-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-3">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="flex items-center justify-center w-10 h-10 border-3 border-sa9-border group-hover:border-sa9-pink transition-colors">
                <LogoMark className="w-7 h-7" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-black text-sm uppercase tracking-[0.2em] text-sa9-pink">
                  SPACESHIP
                </span>
                <span className="font-display font-bold text-[10px] uppercase tracking-[0.3em] text-sa9-cyan">
                  ALPHA 9
                </span>
              </div>
            </Link>
            <p className="text-sa9-text-muted text-sm leading-relaxed mb-4 max-w-xs">
              An AI-native studio out of Atlanta with three arms — software,
              storytelling, and enterprise AI. Six products, a universe of
              original IP streaming now, and governed AI for the Fortune 500.
              Bootstrapped. Zero VC. We build AI that doesn&apos;t suck.
            </p>
            {/* Custom on-brand social icons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex items-center justify-center w-9 h-9 border-3 border-sa9-border bg-sa9-surface text-sa9-text-muted shadow-[3px_3px_0_rgba(0,0,0,0.55)] hover:text-sa9-pink hover:border-sa9-pink hover:shadow-[3px_3px_0_#990044] hover:-translate-y-0.5 hover:[&_svg]:drop-shadow-[0_0_5px_rgba(255,20,147,0.9)] transition-all duration-150"
                >
                  <SocialIcon name={social.icon} />
                </a>
              ))}
            </div>

            <p className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim mb-2">
              Listen &amp; Read
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {listenRead.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  title={l.label}
                  className="flex items-center justify-center w-9 h-9 border-3 border-sa9-border bg-sa9-surface text-sa9-text-muted shadow-[3px_3px_0_rgba(0,0,0,0.55)] hover:text-sa9-cyan hover:border-sa9-cyan hover:shadow-[3px_3px_0_#006680] hover:-translate-y-0.5 hover:[&_svg]:drop-shadow-[0_0_5px_rgba(0,229,255,0.9)] transition-all duration-150"
                >
                  <SocialIcon name={l.icon} />
                </a>
              ))}
            </div>

            <p className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim mb-2">
              Sister Sites
            </p>
            <div className="space-y-1.5">
              {sisterSites.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sa9-text-dim text-xs font-mono hover:text-sa9-pink transition-colors"
                >
                  <SocialIcon name={s.icon} className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-sa9-pink mb-4">
              Products
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More products column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-sa9-pink mb-4">
              More
            </h4>
            <ul className="space-y-2">
              {moreProducts.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio column */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-sa9-cyan mb-4">
              Studio
            </h4>
            <ul className="space-y-2">
              {studioLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sa9-text-muted text-sm hover:text-sa9-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-3 border-sa9-border p-3">
              <p className="font-mono text-[10px] text-sa9-text-dim uppercase tracking-widest mb-1">
                Location
              </p>
              <p className="font-mono text-xs text-sa9-text-muted">
                Atlanta, GA
              </p>
              <p className="font-mono text-[10px] text-sa9-text-dim uppercase tracking-widest mt-2 mb-1">
                Founded
              </p>
              <p className="font-mono text-xs text-sa9-text-muted">2024</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t-3 border-sa9-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sa9-text-dim text-xs font-mono uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Spaceship Alpha 9. All rights
            reserved.
          </p>
          <p className="text-sa9-text-dim text-xs font-mono">
            No algorithms. No noise. Intelligence embedded, not decorated.
          </p>
        </div>
      </div>
    </footer>
  );
}
