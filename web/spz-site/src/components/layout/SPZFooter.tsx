export function SPZFooter() {
  return (
    <footer className="border-t-3 border-sa9-border bg-sa9-surface">
      <div className="warning-stripes" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-3 mb-4">
              <span className="text-2xl" role="img" aria-label="pirate flag">
                🏴‍☠️
              </span>
              <span className="font-display font-black text-xl uppercase tracking-widest text-sa9-cyan">
                SPZ
              </span>
            </a>
            <p className="text-sa9-text-muted text-sm leading-relaxed mb-3">
              Space Pirate Zero. Digital insurgent.
              Captain of Spaceship Alpha 9.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="https://spaceshipalpha9.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sa9-text-dim text-xs font-mono hover:text-sa9-pink transition-colors"
              >
                SA9
              </a>
              <a
                href="https://spacepiratezero.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sa9-text-dim text-xs font-mono hover:text-sa9-pink transition-colors"
              >
                Substack
              </a>
              <a
                href="https://github.com/space-pirate-zero"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sa9-text-dim text-xs font-mono hover:text-sa9-pink transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-widest text-sa9-pink mb-4">
              Transmissions
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://spacepiratezero.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                >
                  Substack
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/gregchambers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/space_pirate_zero/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-widest text-sa9-pink mb-4">
              Music
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://open.spotify.com/artist/5hsu0KPjwVKMCx1hAMFvI4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                >
                  Spotify
                </a>
              </li>
              <li>
                <a
                  href="https://music.apple.com/us/artist/space-pirate-zero/1751347344"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                >
                  Apple Music
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-widest text-sa9-pink mb-4">
              Studio
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://spaceshipalpha9.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                >
                  Spaceship Alpha 9
                </a>
              </li>
              <li>
                <a
                  href="https://spaceshipalpha9.co/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="https://spaceshipalpha9.co/manifesto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sa9-text-muted text-sm hover:text-sa9-pink transition-colors"
                >
                  Manifesto
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-3 border-sa9-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sa9-text-dim text-xs font-mono uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Spaceship Alpha 9. All rights
            reserved.
          </p>
          <p className="text-sa9-text-dim text-xs font-mono">
            No algorithms. No noise. Zero venture capital.
          </p>
        </div>
      </div>
    </footer>
  );
}
