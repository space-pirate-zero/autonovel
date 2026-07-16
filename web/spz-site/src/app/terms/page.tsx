import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Space Pirate Zero',
  description: 'Terms of service for spacepiratezero.com — conditions governing use of this platform.',
  robots: { index: false, follow: false },
};

const sections = [
  {
    heading: 'ACCEPTANCE',
    body: 'By accessing spacepiratezero.com you agree to these terms. If you do not agree, do not use the platform. Use of the site constitutes acceptance of both these Terms and the Privacy Policy.',
  },
  {
    heading: 'INTELLECTUAL_PROPERTY',
    body: 'All content on this platform — including written works, music, visual design, brand strategy documents, and code — is the intellectual property of Greg Chambers (Space Pirate Zero) unless explicitly attributed otherwise. You may share links and brief excerpts with attribution. Reproduction, redistribution, or commercial use without written permission is prohibited.',
  },
  {
    heading: 'PERMITTED_USE',
    body: 'This platform is provided for personal, non-commercial use. You may browse, read, and engage with content for educational, research, and entertainment purposes. You may not scrape, mirror, or systematically download content. You may not use automated systems to interact with the platform without prior written consent.',
  },
  {
    heading: 'USER_TRANSMISSIONS',
    body: 'Any content you submit through the contact form (messages, feedback, ideas) may be read and responded to by Greg Chambers. Unsolicited ideas submitted through the contact form do not create any obligation of confidentiality or compensation. Do not transmit sensitive personal information through the contact form.',
  },
  {
    heading: 'EXTERNAL_CONTENT',
    body: 'This platform links to third-party sites including Substack, YouTube, LinkedIn, GitHub, Forbes, and others. Space Pirate Zero is not responsible for the content, availability, or practices of any external site. Links do not constitute endorsement.',
  },
  {
    heading: 'DISCLAIMER',
    body: 'Content on this platform is provided for archival, experimental, and entertainment purposes. Nothing on this site constitutes legal, financial, medical, or investment advice. The platform is provided "as-is" without warranties of any kind, express or implied.',
  },
  {
    heading: 'LIMITATION_OF_LIABILITY',
    body: 'To the fullest extent permitted by law, Greg Chambers and Space Pirate Zero shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use this platform.',
  },
  {
    heading: 'GOVERNING_LAW',
    body: 'These terms are governed by the laws of the State of California, USA, without regard to conflict-of-law provisions. Any disputes shall be resolved in the courts of Los Angeles County, California.',
  },
  {
    heading: 'MODIFICATIONS',
    body: 'These terms may be updated at any time. Continued use of the platform after an update constitutes acceptance of the revised terms. It is your responsibility to review this page periodically.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cyber-black text-white px-6 py-16 md:px-16">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-4 border-b border-cyber-magenta/20 pb-8">
          <div className="text-[10px] tracking-[0.3em] font-headline text-cyber-magenta uppercase">
            TRANSMISSION // LEGAL_PROTOCOL_02
          </div>
          <h1 className="font-headline text-3xl md:text-4xl tracking-tight text-white">
            TERMS_OF_<span className="text-cyber-magenta">SERVICE</span>
          </h1>
          <p className="font-mono text-xs text-white/40">
            Effective date: 2024-01-01 // Jurisdiction: Decentralized Void // Governing law: California, USA
          </p>
        </div>

        {/* Intro */}
        <p className="font-mono text-sm text-white/60 leading-relaxed">
          These are the operating protocols for{' '}
          <span className="text-cyber-magenta">spacepiratezero.com</span>. Read them.
          They are shorter than most terms of service because this platform values your time.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.heading} className="border-l-2 border-cyber-magenta/30 pl-6 space-y-2">
              <div className="text-[10px] tracking-[0.25em] font-headline text-cyber-magenta uppercase">
                {s.heading}
              </div>
              <p className="font-mono text-sm text-white/60 leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div className="pt-8 border-t border-cyber-magenta/20">
          <Link
            href="/"
            className="font-headline text-[11px] tracking-[0.2em] text-cyber-magenta hover:text-white transition-colors"
          >
            ← RETURN_TO_MAIN_TRANSMISSION
          </Link>
        </div>
      </div>
    </main>
  );
}
