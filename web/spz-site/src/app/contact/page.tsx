import { Metadata } from 'next';

const BASE_URL = 'https://www.spacepiratezero.com';
const OG_IMAGE = `${BASE_URL}/api/og?title=Comms&subtitle=Contact+Space+Pirate+Zero`;

export const metadata: Metadata = {
  title: 'Comms // Contact Space Pirate Zero',
  description:
    'Open a channel with Space Pirate Zero. Booking, press, collaboration, and general inquiries.',
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: 'Comms // Contact Space Pirate Zero',
    description: 'Open a channel with Space Pirate Zero.',
    url: `${BASE_URL}/contact`,
    siteName: 'Space Pirate Zero',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Contact Space Pirate Zero' }],
  },
};

const channels = [
  {
    label: 'EMAIL',
    href: 'mailto:zero@spacepiratezero.com',
    description: 'For press, booking, collaboration, and general inquiries.',
    cta: 'OPEN_CHANNEL',
  },
  {
    label: 'SUBSTACK',
    href: 'https://spacepiratezero.substack.com',
    description: 'Subscribe for dispatches, investigations, and transmissions.',
    cta: 'SUBSCRIBE →',
    external: true,
  },
  {
    label: 'LINKEDIN',
    href: 'https://www.linkedin.com/in/gregchambers/',
    description: 'Enterprise AI, strategy, and professional connections.',
    cta: 'CONNECT →',
    external: true,
  },
  {
    label: 'GITHUB',
    href: 'https://github.com/space-pirate-zero',
    description: 'Open-source projects and Spaceship Alpha 9 code.',
    cta: 'VIEW_CODE →',
    external: true,
  },
  {
    label: 'INSTAGRAM',
    href: 'https://www.instagram.com/space_pirate_zero/',
    description: 'Visual transmissions from the outer edge.',
    cta: 'FOLLOW →',
    external: true,
  },
];

export default function ContactPage() {
  return (
    <main className="pt-16">
      {/* ── HERO ── */}
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,255,0.05),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-sa9-cyan/60 mb-4">
            COMMS_ARRAY // OPEN_FREQUENCIES
          </div>
          <h1 className="font-headline font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-white leading-[0.9] mb-6">
            Open a
            <br />
            <span className="text-sa9-cyan">Channel.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Press inquiries, collaboration proposals, speaking engagements, or just a transmission
            from the void — all frequencies monitored.
          </p>
        </div>
      </section>

      {/* ── CHANNELS ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                {...(channel.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="group flex items-center justify-between gap-6 border border-white/[0.08] bg-white/[0.02] hover:border-sa9-cyan/40 hover:bg-white/[0.04] p-6 transition-all duration-150"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-sa9-cyan/60 mb-1">
                    {channel.label}
                  </div>
                  <p className="text-white/50 text-sm">
                    {channel.description}
                  </p>
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-sa9-cyan/80 group-hover:text-sa9-cyan transition-colors flex-shrink-0">
                  {channel.cta}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
