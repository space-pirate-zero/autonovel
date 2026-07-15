
'use client';

import React from 'react';
import Link from 'next/link';
import { GlitchText } from './GlitchText';
import { Shield, FileText, Info, MessageSquare } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { MailingListSignup } from './MailingListSignup';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 px-4 md:px-10 border-t border-cyber-cyan/20 glass-hud mt-auto">
      <div className="container mx-auto">
        <MailingListSignup />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand/Identity */}
          <div className="space-y-4">
            <div className="font-headline text-lg tracking-tighter text-white">
              SPACE_PIRATE_<span className="text-cyber-magenta">ZERO</span>
            </div>
            <p className="text-xs font-mono text-white/40 max-w-xs leading-relaxed">
              <GlitchText text="Digital headquarters and multi-media archive of Greg Chambers. A transmission from the intersection of corporate innovation and digital rebellion." />
            </p>
          </div>

          {/* Legal Disclaimers */}
          <div className="space-y-4">
            <div className="text-cyber-cyan text-[10px] tracking-[0.2em] font-headline uppercase flex items-center gap-2">
              <Shield size={12} />
              Legal_Protocols
            </div>
            <div className="flex flex-col space-y-2">
              <p className="text-[10px] font-mono text-white/30 leading-tight">
                Disclaimer: The content provided on this platform is for archival and experimental purposes only. All intellectual property is owned by Space Pirate Zero unless otherwise stated.
              </p>
              <div className="flex gap-4 pt-2">
                <Link href="/privacy" className="text-[10px] font-headline text-white/50 hover:text-cyber-cyan transition-colors flex items-center gap-1">
                  <FileText size={10} /> PRIVACY_POLICY
                </Link>
                <Link href="/terms" className="text-[10px] font-headline text-white/50 hover:text-cyber-magenta transition-colors flex items-center gap-1">
                  <Info size={10} /> TERMS_OF_SERVICE
                </Link>
              </div>
            </div>
          </div>

          {/* System Status / Copyright */}
          <div className="space-y-4 md:text-right">
            <div className="text-cyber-magenta text-[10px] tracking-[0.2em] font-headline uppercase flex items-center md:justify-end gap-2">
              <MessageSquare size={12} />
              System_Coordinates
            </div>
            <div className="text-[10px] font-mono text-white/40 space-y-1">
              <div>ESTABLISHED: 2024</div>
              <div>LOCATION: DECENTRALIZED_VOID</div>
              <div className="pt-2">
                <a
                  href="https://spaceshipalpha9.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyber-magenta hover:text-white transition-colors underline underline-offset-4 decoration-cyber-magenta/30"
                >
                  SPACESHIP_ALPHA_9 →
                </a>
              </div>
              <div className="pt-1">
                <a
                  href="https://stylelift.fashion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyber-cyan hover:text-white transition-colors underline underline-offset-4 decoration-cyber-cyan/30"
                >
                  STYLELIFT →
                </a>
              </div>
              <div className="pt-2">
                <ContactForm trigger={
                  <button className="text-cyber-cyan hover:text-white transition-colors underline underline-offset-4 decoration-cyber-cyan/30">
                    INITIATE_DIRECT_UPLINK
                  </button>
                } />
              </div>
              <div className="pt-4 text-cyber-cyan/60">
                © {currentYear} SPACESHIP ALPHA 9 LLC // SPACE PIRATE ZERO // ALL_RIGHTS_RESERVED
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Scanline Visual */}
        <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent shadow-[0_0_8px_rgba(0,255,255,0.2)]" />
      </div>
    </footer>
  );
}
