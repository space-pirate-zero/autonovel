import { Metadata } from 'next';
import Link from 'next/link';
import { getAllContent } from '@/lib/content-loader';
import { Footer } from '@/components/hud/Footer';
import { SynchronizedSignals } from '@/components/content/SynchronizedSignals';
import { GlitchText } from '@/components/hud/GlitchText';

const OG_IMAGE = 'https://www.spacepiratezero.com/api/og?title=Dossier+%2F%2F+Greg+Chambers&subtitle=Space+Pirate+Zero+%E2%80%94+SpaceShip+Alpha+9&type=bio';

export const metadata: Metadata = {
  title: 'Dossier // Greg Chambers',
  description: 'The official dossier on Greg Chambers (Space Pirate Zero) — enterprise architect, inventor, OSINT/SIGINT operator, red teamer, musician, and investigative AI writer. Co-Founder & CTO of SpaceShip Alpha 9. From Coca-Cola to U.S. patents to dark-web threat intelligence to lo-fi cosmic music.',
  keywords: [
    'Greg Chambers bio', 'Space Pirate Zero dossier', 'SpaceShip Alpha 9 founder',
    'Greg Chambers Coca-Cola', 'Greg Chambers patents', 'Greg Chambers inventor',
    'Greg Chambers CTO', 'StyleLift founder', 'Therabody inventor',
    'Greg Chambers OSINT', 'Space Pirate Zero red team', 'dark web threat intelligence',
    'SIGINT analyst', 'offensive security research',
  ],
  alternates: {
    canonical: 'https://www.spacepiratezero.com/bio',
  },
  openGraph: {
    title: 'Dossier // Greg Chambers | Space Pirate Zero | SpaceShip Alpha 9',
    description: 'From Coca-Cola digital insurgency to U.S. patents to StyleLift. The full transmission log of Greg Chambers — Co-Founder & CTO of SpaceShip Alpha 9.',
    url: 'https://www.spacepiratezero.com/bio',
    siteName: 'Space Pirate Zero',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Greg Chambers — Space Pirate Zero — SpaceShip Alpha 9 Dossier', type: 'image/jpeg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dossier // Greg Chambers | Space Pirate Zero',
    description: 'Co-Founder & CTO of SpaceShip Alpha 9. From Coca-Cola digital insurgency to U.S. patents to lo-fi cosmic music.',
    images: [OG_IMAGE],
  },
};

const TIMELINE = [
  {
    id: 'spaceshipalpha9',
    era: 'COMMAND_VESSEL',
    label: 'SPACESHIP ALPHA 9',
    role: 'Co-Founder // CTO',
    color: 'magenta' as const,
    status: 'ACTIVE',
    entries: [
      {
        signal: 'PARENT_COMPANY',
        body: 'SpaceShip Alpha 9 LLC — the holding company and innovation studio behind StyleLift and everything that follows. Co-founded with Daniela Chambers. Where enterprise-grade AI meets consumer products.',
        link: 'https://spaceshipalpha9.co',
        linkLabel: 'SPACESHIPALPHA9.CO →',
      },
      {
        signal: 'OPERATIONAL_SCOPE',
        body: 'AI-powered consumer products. Enterprise innovation consulting. The bridge between corporate infrastructure and consumer magic. Atlanta-based, globally deployed.',
      },
    ],
  },
  {
    id: 'spz',
    era: 'RUNNING_PARALLEL',
    label: 'SPACE PIRATE ZERO',
    role: 'Musician // Essayist // Gonzo Journalist',
    color: 'cyan' as const,
    status: 'ACTIVE',
    entries: [
      {
        signal: 'VAUDEVILLE_NEBULA.EP',
        body: 'Lo-fi, cosmic, and unapologetically strange. The Vaudeville Nebula EP is what happens when corporate conference rooms lose their grip and the signal goes rogue. Available on Spotify and Apple Music.',
      },
      {
        signal: 'SUBSTACK // INVESTIGATIVE_AI',
        body: 'Weekly dispatches from the intersection of enterprise power and artificial intelligence. Cultural commentary with teeth. The last honest read on what the machines are actually doing.',
        link: 'https://spacepiratezero.substack.com',
        linkLabel: 'ACCESS_SUBSTACK_FEED →',
      },
      {
        signal: 'ALIAS_CONFIRMED',
        body: 'The deep-web crawlers know him as Space Pirate Zero. The algorithms have been briefed. The persona is not a mask — it\'s the frequency beneath the frequency.',
      },
    ],
  },
  {
    id: 'shadow-ops',
    era: 'SHADOW_OPERATIONS',
    label: 'THREAT INTELLIGENCE // RED TEAM',
    role: 'OSINT Operator // SIGINT Analyst // Red Teamer',
    color: 'cyan' as const,
    status: 'DARK',
    entries: [
      {
        signal: 'DARK_WEB_RECON',
        body: 'Years spent in the parts of the network that don\'t show up on search engines. Mapping threat-actor infrastructure, tracing leaked datasets back to their source, and reading the underground economy the way most people read the news. The dark web isn\'t a place — it\'s a signal, and it never stops transmitting.',
      },
      {
        signal: 'OSINT_TRADECRAFT',
        body: 'Legendary open-source intelligence tradecraft. Turning public breadcrumbs — DNS records, metadata, cached pages, social exhaust — into complete pictures. If it touched a wire, it left a trace. The art is knowing which trace matters.',
      },
      {
        signal: 'SIGINT_ANALYSIS',
        body: 'Signals intelligence on the modern stack: traffic patterns, beacon behavior, the shape of a network under load. Reading intent in the noise. The machines are always talking — the trick is learning their dialect.',
      },
      {
        signal: 'RED_TEAM_OPS',
        body: 'Adversarial simulation and offensive security research alongside major cybersecurity research collectives and red-team outfits — [REDACTED]. Authorized breach work: finding the door before the real attackers do, then documenting exactly how it opened. You cannot defend a system you have never tried to break.',
      },
      {
        signal: 'ASSESSMENT',
        body: 'The same instinct that reverse-engineers an attack surface reverse-engineers a market, a machine-learning model, a 138-year-old corporation. Offense is just curiosity with a deadline.',
      },
    ],
  },
  {
    id: 'stylelift',
    era: 'PRESENT_OPERATION',
    label: 'STYLELIFT',
    role: 'Co-Founder // CTO',
    color: 'magenta' as const,
    status: 'LIVE',
    entries: [
      {
        signal: 'MISSION_BRIEF',
        body: 'Fashion is a data problem wearing a beautiful disguise. StyleLift is the software layer that the industry never knew it needed — AI-powered, behavior-driven, built for the way humans actually shop. A SpaceShip Alpha 9 product.',
        link: 'https://stylelift.fashion',
        linkLabel: 'STYLELIFT.FASHION →',
      },
      {
        signal: 'OPERATIONAL_STATUS',
        body: 'Active. Building. The clothes on your back are the next frontier for intelligent systems.',
      },
    ],
  },
  {
    id: 'therabody',
    era: 'BIOTECH_INCURSION',
    label: 'THERABODY',
    role: 'Co-Inventor',
    color: 'cyan' as const,
    status: 'PATENTED',
    entries: [
      {
        signal: 'US_PATENT_11432994',
        body: 'Intelligence Engine. An AI-driven system that learns how the human body responds to treatment — personalizing recovery in real-time. Co-invented with the Therabody product team.',
      },
      {
        signal: 'US_PATENT_11600383',
        body: 'Networked Theft-Prevention System. A distributed security architecture for high-value consumer hardware. The kind of problem that looks easy until you\'re the one who has to solve it.',
      },
      {
        signal: 'ASSESSMENT',
        body: 'From fizzy water to deep tissue. Different verticals, same core belief: intelligence should be embedded in the product, not bolted on after the fact.',
      },
    ],
  },
  {
    id: 'coke',
    era: 'CORPORATE_INSURGENCY',
    label: 'THE COCA-COLA COMPANY',
    role: 'Global Group Director of Digital Innovation',
    color: 'magenta' as const,
    status: 'LEGEND',
    entries: [
      {
        signal: 'MISSION_OBJECTIVE',
        body: 'Teach a 138-year-old soda company how to think. Not just digitize — actually think. The difference between a vending machine and an intelligence is the difference between a transaction and a relationship.',
      },
      {
        signal: 'OPERATION_CONVERSATIONAL_AI',
        body: 'Deployed conversational AI into physical vending infrastructure. The machine knew what you wanted before you did. Commerce as dialogue. Commerce as presence.',
      },
      {
        signal: 'OPERATION_VR_12PACK',
        body: 'Embedded a VR headset inside a 12-pack of Coke. Not a prototype. An actual product on actual shelves. Because the best way to demonstrate the future is to ship it.',
      },
      {
        signal: 'OPERATION_PROXIMITY_RETAIL',
        body: 'Built an AI-powered retail platform on Google Cloud. Proximity beacons. Behavior-based personalization. The store that watches, learns, and adapts.',
      },
      {
        signal: 'PRESS_COVERAGE',
        body: 'Forbes. Fortune. VentureBeat. The suits noticed. The journalists noticed. The future, for a moment, had a face.',
      },
    ],
  },
];

function TimelineNode({
  era,
  label,
  role,
  color,
  status,
  entries,
}: (typeof TIMELINE)[number]) {
  const isCyan = color === 'cyan';
  const accentColor = isCyan ? 'border-cyber-cyan' : 'border-cyber-magenta';
  const textColor = isCyan ? 'text-cyber-cyan' : 'text-cyber-magenta';
  const bgColor = isCyan ? 'bg-cyber-cyan/5' : 'bg-cyber-magenta/5';
  const dotColor = isCyan ? 'bg-cyber-cyan shadow-[0_0_8px_#00FFFF]' : 'bg-cyber-magenta shadow-[0_0_8px_#FF00FF]';

  return (
    <div className="relative pl-10 md:pl-16">
      {/* Timeline spine dot */}
      <div className={`absolute left-0 top-2 w-3 h-3 rounded-full ${dotColor} ring-2 ring-offset-2 ring-offset-cyber-black ${isCyan ? 'ring-cyber-cyan/30' : 'ring-cyber-magenta/30'}`} />
      {/* Spine line */}
      <div className="absolute left-[5px] top-5 bottom-0 w-[1px] bg-gradient-to-b from-white/10 to-transparent" />

      <div className={`glass-hud border-l-2 ${accentColor} p-6 mb-12`}>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <div className={`font-headline text-[9px] tracking-[0.25em] ${textColor} mb-1 opacity-70`}>
              {era}
            </div>
            <h2 className={`font-headline text-lg md:text-xl tracking-tight text-white`}>
              <GlitchText text={label} />
            </h2>
            <div className="text-white/40 font-mono text-xs mt-1">{role}</div>
          </div>
          <div className={`text-[8px] font-headline tracking-[0.2em] ${textColor} border ${accentColor}/40 px-3 py-1 ${bgColor} shrink-0`}>
            {status}
          </div>
        </div>

        {/* Log entries */}
        <div className="space-y-5">
          {entries.map((entry, i) => (
            <div key={i} className="border-t border-white/5 pt-4 first:border-0 first:pt-0">
              <div className={`font-headline text-[8px] tracking-[0.2em] ${textColor} mb-2 flex items-center gap-2`}>
                <span className="opacity-60">▶</span>
                {entry.signal}
              </div>
              <p className="text-white/60 font-mono text-xs leading-relaxed">
                {entry.body}
              </p>
              {'link' in entry && entry.link && (
                <a
                  href={entry.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 mt-3 text-[9px] font-headline tracking-widest ${textColor} hover:text-white transition-colors border-b ${accentColor}/30 hover:border-white/50 pb-px`}
                >
                  {entry.linkLabel}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const bioJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@id': 'https://www.spacepiratezero.com/#greg-chambers',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.spacepiratezero.com' },
      { '@type': 'ListItem', position: 2, name: 'Dossier', item: 'https://www.spacepiratezero.com/bio' },
    ],
  },
};

export default async function BioPage() {
  const allContent = await getAllContent();
  return (
    <main className="relative min-h-screen bg-cyber-black flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bioJsonLd) }}
      />

      {/* Background signals */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <SynchronizedSignals />
      </div>

      <div className="flex-grow pt-32 pb-20 px-4 md:px-10 max-w-4xl mx-auto w-full relative z-10">

        {/* Page header */}
        <div className="mb-16">
          <div className="text-cyber-cyan font-headline text-[9px] tracking-[0.3em] mb-3 opacity-60">
            CLASSIFIED_DOSSIER // SUBJECT: GREG_CHAMBERS
          </div>
          <h1 className="font-headline text-3xl md:text-5xl text-white tracking-tight mb-4">
            <GlitchText text="TRANSMISSION LOG" />
          </h1>
          <div className="h-[2px] w-24 bg-gradient-to-r from-cyber-cyan to-cyber-magenta mb-6" />
          <p className="text-white/50 font-mono text-sm leading-relaxed max-w-xl">
            Enterprise architect. Inventor. OSINT/SIGINT operator. Red teamer. Musician. Gonzo journalist.
            The following is a reconstruction of signal events across multiple verticals — some of them
            classified. Cross-reference at your own risk.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {TIMELINE.map((node) => (
            <TimelineNode key={node.id} {...node} />
          ))}

          {/* Origin node */}
          <div className="relative pl-10 md:pl-16">
            <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-white/20 ring-1 ring-white/10" />
            <div className="text-white/20 font-headline text-[9px] tracking-[0.3em] pb-8">
              SIGNAL_ORIGIN // CLASSIFIED
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="border-t border-cyber-cyan/20 pt-8 mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Link
            href="/"
            className="text-[10px] font-headline tracking-widest text-white/40 hover:text-cyber-cyan transition-colors flex items-center gap-2"
          >
            ← RETURN_TO_COMMAND_CENTER
          </Link>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://spaceshipalpha9.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-headline tracking-widest text-cyber-magenta hover:text-white transition-colors flex items-center gap-2"
            >
              SPACESHIP_ALPHA_9 →
            </a>
            <a
              href="https://spacepiratezero.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-headline tracking-widest text-cyber-cyan hover:text-white transition-colors flex items-center gap-2"
            >
              ACCESS_SUBSTACK_FEED →
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
