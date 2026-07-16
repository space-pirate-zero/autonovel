import Link from 'next/link';
import { GlitchText } from './GlitchText';

export function Bio() {
  return (
    <div className="glass-hud p-8 border-l-4 border-cyber-cyan h-full flex flex-col overflow-hidden">
      <div className="text-cyber-cyan text-xl md:text-2xl font-headline mb-4 flex-shrink-0">
        <GlitchText text="GREG CHAMBERS // SPACE PIRATE ZERO" />
      </div>

      <div className="text-white/70 font-mono text-xs leading-relaxed mb-4 flex-shrink-0">
        <GlitchText text="Enterprise architect. Inventor. Gonzo journalist. The suit who ate the system from the inside." />
      </div>

      <div className="space-y-3 border-t border-cyber-cyan/20 pt-4 overflow-y-auto custom-scrollbar pr-2 flex-grow">
        <div className="flex items-start gap-3">
          <span className="text-cyber-cyan font-headline text-[8px] tracking-widest mt-1 shrink-0 w-20">COCA-COLA</span>
          <span className="text-white/60 text-xs font-mono leading-relaxed">Global Director of Digital Innovation — taught a 138-year-old soda company how to think. Forbes, Fortune, VentureBeat.</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-cyber-magenta font-headline text-[8px] tracking-widest mt-1 shrink-0 w-20">THERABODY</span>
          <span className="text-white/60 text-xs font-mono leading-relaxed">Co-invented 2 U.S. patents — AI intelligence engine (#11432994) and networked security system (#11600383).</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-cyber-cyan font-headline text-[8px] tracking-widest mt-1 shrink-0 w-20">STYLELIFT</span>
          <span className="text-white/60 text-xs font-mono leading-relaxed">Founder/CTO — fashion meets software. AI aimed at the clothes on your back.</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-cyber-magenta font-headline text-[8px] tracking-widest mt-1 shrink-0 w-20">SPZ</span>
          <span className="text-white/60 text-xs font-mono leading-relaxed">Vaudeville Nebula EP. Investigative AI writing on Substack. Digital insurgent at large.</span>
        </div>

        <div className="border-t border-cyber-magenta/20 pt-4 mt-2">
          <p className="italic text-cyber-cyan/80 border-l-2 border-cyber-cyan/30 pl-3 py-1 text-xs bg-cyber-cyan/5">
            <GlitchText text={'"AI is the kernel that powers the experience."'} />
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-cyber-cyan/20 mt-4">
        <Link
          href="/bio"
          className="flex items-center gap-2 text-[10px] font-headline tracking-widest text-cyber-cyan hover:text-white transition-colors group"
        >
          <span className="text-cyber-magenta group-hover:animate-pulse">&#9658;</span>
          VIEW_FULL_DOSSIER
          <span className="text-cyber-cyan/40 group-hover:text-cyber-cyan transition-colors ml-auto">&#8594;</span>
        </Link>
      </div>
    </div>
  );
}
