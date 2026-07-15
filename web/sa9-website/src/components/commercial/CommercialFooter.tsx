import Link from "next/link";
import type { Product } from "@/lib/products";

export function CommercialFooter({ product }: { product: Product }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className="bg-sa9-surface border-t-3 border-sa9-border"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Product identity */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl" aria-hidden="true">
                {product.icon}
              </span>
              <span className="font-display font-bold uppercase tracking-wider text-sa9-text">
                {product.name}
              </span>
            </div>
            <p className="font-body text-sa9-text-dim text-sm">
              Part of the Spaceship Alpha 9 fleet.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-sa9-text-muted mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://spaceshipalpha9.co"
                  className="font-mono text-sm text-sa9-text-dim hover:text-sa9-pink transition-colors duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  spaceshipalpha9.co
                </a>
              </li>
              <li>
                <a
                  href="https://spaceshipalpha9.co/products"
                  className="font-mono text-sm text-sa9-text-dim hover:text-sa9-pink transition-colors duration-150"
                >
                  Product Catalog
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-sa9-text-muted mb-4">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/space-pirate-zero"
                  className="font-mono text-sm text-sa9-text-dim hover:text-sa9-pink transition-colors duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://bsky.app/profile/spaceshipalpha9.co"
                  className="font-mono text-sm text-sa9-text-dim hover:text-sa9-pink transition-colors duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bluesky
                </a>
              </li>
              <li>
                <a
                  href="https://spaceshipalpha9.substack.com"
                  className="font-mono text-sm text-sa9-text-dim hover:text-sa9-pink transition-colors duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Substack
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t-3 border-sa9-border">
          <p className="font-mono text-xs text-sa9-text-dim text-center">
            &copy; {year} Spaceship Alpha 9. All rights reserved.
          </p>
        </div>
      </div>

      {/* Warning stripe decoration */}
      <div aria-hidden="true">
        <div className="h-1 bg-sa9-pink" />
        <div className="h-1 bg-sa9-surface" />
        <div className="h-1 bg-sa9-pink" />
      </div>
    </footer>
  );
}
