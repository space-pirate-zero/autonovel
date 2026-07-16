
'use client';

import { BrandWork } from '@/types/content';
import { GlitchText } from '../hud/GlitchText';
import {
  Terminal,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  ChevronRight,
  Share2,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandWorkDisplayProps {
  content: BrandWork;
}

export function BrandWorkDisplay({ content }: BrandWorkDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({ title: 'LINK_COPIED', description: 'Coordinates saved to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnX = () => {
    const text = encodeURIComponent(`Transmission from Space Pirate Zero: ${content.title}`);
    const url = encodeURIComponent(currentUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-10 px-4 md:px-0">

      {/* Return */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[10px] font-headline text-white/40 hover:text-cyber-cyan transition-colors uppercase tracking-[0.2em] group"
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        Return_to_Command_Center
      </Link>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start md:items-end">

        {/* Cover image */}
        <div className="relative w-full md:w-72 lg:w-80 aspect-square border-2 border-cyber-cyan/40 group overflow-hidden shrink-0 shadow-[0_0_25px_rgba(0,255,255,0.15)]">
          <Image
            src={content.coverImage}
            alt={content.title}
            fill
            unoptimized
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors duration-500" />
          <div className="absolute top-3 left-3 p-1.5 glass-hud border border-cyber-cyan/50 backdrop-blur-md">
            <Terminal size={16} className="text-cyber-cyan" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyber-cyan/30 animate-scanline" />
        </div>

        {/* Title + meta */}
        <div className="flex-grow space-y-5 min-w-0">
          <div className="font-headline text-[10px] tracking-[0.4em] uppercase text-cyber-cyan">
            BRAND_ARCHIVE_NODE // {content.id}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline text-white leading-none tracking-tighter break-words">
            <GlitchText text={content.title} />
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono text-white/40 uppercase tracking-widest bg-white/5 px-4 py-3 border border-white/5">
            {content.role && (
              <div className="flex items-center gap-2 w-full text-white/60">
                {content.role}
              </div>
            )}
            {content.period && (
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-cyber-cyan" />
                {content.period}
              </div>
            )}
            {content.location && (
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-cyber-cyan" />
                {content.location}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Layers size={12} className="text-cyber-cyan" />
              {content.phases.length} MISSION{content.phases.length !== 1 ? 'S' : ''}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {content.topicTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 border border-cyber-cyan/20 text-cyber-cyan/60 font-headline text-[9px] tracking-widest uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Share */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="outline"
              onClick={shareOnX}
              className="h-8 px-3 border-white/10 hover:border-cyber-cyan hover:text-cyber-cyan font-headline text-[10px] tracking-widest uppercase bg-transparent"
            >
              <Twitter size={11} className="mr-1.5" /> SHARE
            </Button>
            <Button
              variant="outline"
              onClick={shareOnLinkedIn}
              className="h-8 px-3 border-white/10 hover:border-cyber-cyan hover:text-cyber-cyan font-headline text-[10px] tracking-widest uppercase bg-transparent"
            >
              <Linkedin size={11} className="mr-1.5" /> SHARE
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="h-8 px-3 border-white/10 hover:border-cyber-cyan hover:text-cyber-cyan font-headline text-[10px] tracking-widest uppercase bg-transparent"
            >
              {copied ? <Check size={11} className="mr-1.5" /> : <Copy size={11} className="mr-1.5" />}
              COPY LINK
            </Button>
          </div>
        </div>
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
      <div className="glass-hud border-l-2 border-cyber-cyan bg-black/40 px-6 py-5">
        <div className="font-headline text-[9px] tracking-[0.3em] uppercase text-cyber-cyan/50 mb-2">
          MISSION_BRIEF
        </div>
        <p className="text-sm font-mono text-white/60 leading-relaxed">{content.description}</p>
      </div>

      {/* ── PHASE TIMELINE ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="font-headline text-[10px] tracking-[0.3em] uppercase text-cyber-cyan flex items-center gap-2 mb-6">
          <Share2 size={12} /> OPERATION_LOG // {content.phases.length} PHASES
        </div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-cyber-cyan/40 via-cyber-cyan/10 to-transparent hidden md:block" />

          <div className="space-y-3">
            {content.phases.map((phase, idx) => (
              <div key={idx} className="relative md:pl-12">
                {/* Timeline node */}
                <div className="hidden md:flex absolute left-0 top-4 w-10 h-10 items-center justify-center">
                  <div className={cn(
                    'w-4 h-4 border-2 rotate-45 transition-all duration-300',
                    expandedPhase === idx
                      ? 'border-cyber-cyan bg-cyber-cyan/20 shadow-[0_0_12px_rgba(0,255,255,0.4)]'
                      : 'border-white/20 bg-black'
                  )} />
                </div>

                <button
                  onClick={() => setExpandedPhase(expandedPhase === idx ? null : idx)}
                  className={cn(
                    'w-full text-left glass-hud border transition-all duration-200 group',
                    expandedPhase === idx
                      ? 'border-cyber-cyan/40 bg-cyber-cyan/5'
                      : 'border-white/5 hover:border-cyber-cyan/20 bg-black/40'
                  )}
                >
                  <div className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={cn(
                        'font-mono text-[10px] shrink-0 tabular-nums',
                        expandedPhase === idx ? 'text-cyber-cyan' : 'text-white/20'
                      )}>
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className={cn(
                        'font-headline text-sm uppercase tracking-wide truncate transition-colors',
                        expandedPhase === idx ? 'text-cyber-cyan' : 'text-white/70 group-hover:text-white'
                      )}>
                        {phase.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {phase.period && (
                        <span className="font-mono text-[9px] text-white/25 hidden sm:block tracking-widest">
                          {phase.period}
                        </span>
                      )}
                      <ChevronRight
                        size={14}
                        className={cn(
                          'text-white/30 transition-all duration-200',
                          expandedPhase === idx ? 'rotate-90 text-cyber-cyan' : 'group-hover:text-white/60'
                        )}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                {expandedPhase === idx && (
                  <div className="border border-t-0 border-cyber-cyan/40 bg-black/60 px-5 py-6 space-y-5">
                    <p className="text-sm font-mono text-white/60 leading-relaxed">
                      {phase.content}
                    </p>

                    {phase.media && phase.media.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        {phase.media.map((url, i) => (
                          <div key={i} className="relative aspect-video border border-cyber-cyan/20 overflow-hidden group">
                            <Image
                              src={url}
                              alt={`${phase.name} — media ${i + 1}`}
                              fill
                              unoptimized
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SKILLS MATRIX ──────────────────────────────────────────────── */}
      <div className="glass-hud border border-white/5 bg-black/40 p-6 space-y-4">
        <div className="font-headline text-[10px] tracking-[0.3em] uppercase text-cyber-magenta flex items-center gap-2">
          <Terminal size={12} /> TECH_STACK // CAPABILITIES
        </div>
        <div className="flex flex-wrap gap-2">
          {content.topicTags.map((tag) => (
            <div
              key={tag}
              className="px-3 py-1.5 border border-cyber-magenta/20 hover:border-cyber-magenta/50 bg-cyber-magenta/5 hover:bg-cyber-magenta/10 transition-all group"
            >
              <span className="font-headline text-[9px] tracking-widest uppercase text-cyber-magenta/60 group-hover:text-cyber-magenta transition-colors">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
