
import { SocialContent } from '@/types/content';
import Link from 'next/link';

interface SocialContentDisplayProps {
  content: SocialContent;
}

export function SocialContentDisplay({ content }: SocialContentDisplayProps) {
  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-8">
      <div className="glass-hud border border-cyber-cyan/30 p-10 max-w-md w-full text-center space-y-6">
        <Link href="/" className="text-[10px] font-headline tracking-widest text-cyber-cyan/60 hover:text-cyber-cyan transition-colors uppercase">
          ← COMMAND_CENTER
        </Link>

        <div className="pt-4">
          <div className="text-xs font-headline tracking-widest text-cyber-cyan/50 uppercase mb-2">
            SOCIAL TRANSMISSION
          </div>
          <h1 className="text-3xl font-headline tracking-tighter text-white mb-4">
            {content.platform.toUpperCase()}
          </h1>
          <p className="text-sm text-white/60 leading-relaxed">
            {content.description}
          </p>
        </div>

        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 border border-cyber-cyan/40 hover:border-cyber-cyan bg-cyber-cyan/5 hover:bg-cyber-cyan/10 text-cyber-cyan font-headline text-xs tracking-widest uppercase transition-all"
        >
          VIEW ON {content.platform.toUpperCase()} →
        </a>
      </div>
    </div>
  );
}
