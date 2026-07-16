import type { NavItem, SiteConfig } from "../types";

interface FooterProps {
  site: SiteConfig;
  nav?: NavItem[];
  className?: string;
}

const SA9_LINKS: NavItem[] = [
  { label: "Products", href: "https://spaceshipalpha9.co/products" },
  { label: "Dispatches", href: "https://spaceshipalpha9.co/dispatches" },
  { label: "About", href: "https://spaceshipalpha9.co/about" },
  { label: "Contact", href: "https://spaceshipalpha9.co/contact" },
];

const LEGAL_LINKS: NavItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/**
 * Shared footer for all SA9 marketing sites.
 * Design-system-agnostic — uses CSS classes prefixed with `sa9-footer-`.
 */
export function Footer({ site, nav, className = "" }: FooterProps) {
  const year = new Date().getFullYear();
  const links = nav ?? SA9_LINKS;

  return (
    <footer className={`sa9-footer border-t py-12 px-6 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="sa9-footer-brand font-mono text-sm font-bold tracking-wider uppercase">
              {site.name}
            </p>
            <p className="sa9-footer-description mt-2 text-sm opacity-70">
              {site.description}
            </p>
            <p className="sa9-footer-sa9 mt-4 text-xs opacity-50">
              A{" "}
              <a href="https://spaceshipalpha9.co" className="underline hover:opacity-100">
                Spaceship Alpha 9
              </a>{" "}
              product
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="sa9-footer-heading font-mono text-xs font-bold tracking-wider uppercase mb-4">
              Navigation
            </p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="sa9-footer-link text-sm opacity-70 hover:opacity-100 transition-opacity"
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="sa9-footer-heading font-mono text-xs font-bold tracking-wider uppercase mb-4">
              Legal
            </p>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="sa9-footer-link text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sa9-footer-copyright mt-12 pt-8 border-t text-center text-xs opacity-50">
          &copy; {year} Spaceship Alpha 9. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
