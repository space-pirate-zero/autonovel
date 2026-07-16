import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Space Pirate Zero',
  description: 'Privacy policy for spacepiratezero.com — how we handle data transmitted through this platform.',
  robots: { index: false, follow: false },
};

const sections = [
  {
    heading: 'DATA_COLLECTION',
    body: 'This platform collects data you voluntarily transmit via the contact form (name, email address, message content) and anonymous usage analytics via Google Analytics and a first-party analytics beacon. Analytics data includes page views, referral sources, and general device information. No individual behavioral profiling is performed.',
  },
  {
    heading: 'DATA_STORAGE',
    body: 'Contact form submissions are stored in a PostgreSQL database hosted on Google Kubernetes Engine (GKE), under standard security protocols. Data is retained solely to enable responses to your inquiry and is not sold, licensed, or shared with any third party.',
  },
  {
    heading: 'COOKIES',
    body: 'This site uses Google Analytics cookies for anonymous usage measurement. No advertising cookies or cross-site tracking cookies are used. Analytics cookies can be blocked by your browser without affecting site functionality.',
  },
  {
    heading: 'EXTERNAL_LINKS',
    body: 'This platform links to external services including Substack, YouTube, LinkedIn, GitHub, and Forbes. Once you leave this domain, their respective privacy policies govern data collection. Space Pirate Zero has no control over and accepts no responsibility for external data practices.',
  },
  {
    heading: 'YOUR_RIGHTS',
    body: 'You may request deletion of any data submitted through the contact form by transmitting a deletion request to the same channel. Requests will be honored within 30 days. No data is retained beyond what is necessary to respond to your initial contact.',
  },
  {
    heading: 'UPDATES',
    body: 'This policy may be updated as the platform evolves. Continued use of this site following any update constitutes acceptance of the revised terms. The effective date of the current version is displayed below.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cyber-black text-white px-6 py-16 md:px-16">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-4 border-b border-cyber-cyan/20 pb-8">
          <div className="text-[10px] tracking-[0.3em] font-headline text-cyber-cyan uppercase">
            TRANSMISSION // LEGAL_PROTOCOL_01
          </div>
          <h1 className="font-headline text-3xl md:text-4xl tracking-tight text-white">
            PRIVACY_<span className="text-cyber-cyan">POLICY</span>
          </h1>
          <p className="font-mono text-xs text-white/40">
            Effective date: 2024-01-01 // Jurisdiction: Decentralized Void // Governing law: California, USA
          </p>
        </div>

        {/* Intro */}
        <p className="font-mono text-sm text-white/60 leading-relaxed">
          This policy governs data handling at{' '}
          <span className="text-cyber-cyan">spacepiratezero.com</span> — the digital headquarters of Greg Chambers.
          This platform is built for archival and creative transmission, not surveillance.
          Data collection is minimal by design.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.heading} className="border-l-2 border-cyber-cyan/30 pl-6 space-y-2">
              <div className="text-[10px] tracking-[0.25em] font-headline text-cyber-cyan uppercase">
                {s.heading}
              </div>
              <p className="font-mono text-sm text-white/60 leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div className="pt-8 border-t border-cyber-cyan/20">
          <Link
            href="/"
            className="font-headline text-[11px] tracking-[0.2em] text-cyber-cyan hover:text-white transition-colors"
          >
            ← RETURN_TO_MAIN_TRANSMISSION
          </Link>
        </div>
      </div>
    </main>
  );
}
