
'use client';

import { BookContent } from '@/types/content';
import { GlitchText } from '../hud/GlitchText';
import {
  BookOpen,
  User,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Shield,
  FileText,
  BadgeCheck,
  Zap,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface BookContentDisplayProps {
  content: BookContent;
}

export function BookContentDisplay({ content }: BookContentDisplayProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [intelOpen, setIntelOpen] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState(content.htmlContent || '');

  // Sanitize HTML to prevent XSS
  useEffect(() => {
    if (content.htmlContent) {
      import('dompurify').then(({ default: DOMPurify }) => {
        setSanitizedHtml(DOMPurify.sanitize(content.htmlContent || ''));
      });
    }
  }, [content.htmlContent]);

  useEffect(() => {
    try {
      setFormattedDate(format(new Date(content.timestamp), 'yyyy.MM.dd'));
    } catch (e) {
      setFormattedDate('####.##.##');
    }
  }, [content.timestamp]);

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10">
      {/* Return Path */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-[10px] font-headline text-white/40 hover:text-cyber-magenta transition-colors uppercase tracking-[0.2em] group"
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        Return_to_Command_Center
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cover Art Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative aspect-[2/3] border-2 border-cyber-magenta/30 shadow-[0_0_40px_rgba(255,0,255,0.15)] overflow-hidden group">
            <Image 
              src={content.coverImage} 
              alt={content.title} 
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="px-3 py-1 bg-cyber-magenta text-black font-headline text-[9px] tracking-widest uppercase w-fit">
                {content.status || 'ARCHIVAL_NODE'}
              </div>
            </div>
          </div>

          <div className="glass-hud p-6 border-l-2 border-cyber-magenta space-y-4">
            <div className="text-[10px] font-headline text-cyber-magenta tracking-widest uppercase flex items-center gap-2">
              <Shield size={12} /> PROTOCOL_METADATA
            </div>
            <div className="space-y-3">
              {content.topicTags.map(tag => (
                <div key={tag} className="text-[10px] font-mono text-white/40 flex items-center gap-2 uppercase">
                  <span className="w-1 h-1 bg-cyber-magenta rounded-full" /> {tag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <div className="font-headline text-[10px] text-cyber-magenta tracking-[0.4em] uppercase">
              LITERARY_ARCHIVE // ID_{content.id.substring(0, 8)}
            </div>
            <h1 className="text-4xl md:text-6xl font-headline text-white leading-tight">
              <GlitchText text={content.title} />
            </h1>
            
            <div className="flex flex-wrap gap-6 text-xs font-mono text-white/50 uppercase tracking-widest border-y border-white/10 py-4">
              <div className="flex items-center gap-2">
                <User size={14} className="text-cyber-magenta" />
                {content.author || 'GREG CHAMBERS'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-cyber-magenta" />
                RELEASE: {formattedDate}
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck size={14} className="text-cyber-magenta" />
                STATUS: {content.status || 'ACTIVE'}
              </div>
            </div>
          </div>

          <div className="glass-hud p-8 border-l-4 border-cyber-cyan bg-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-cyber-cyan/20 animate-scanline" />
            <div className="text-[10px] font-headline text-cyber-cyan mb-4 tracking-[0.3em] uppercase flex items-center gap-2">
              <FileText size={12} /> Archival_Description
            </div>
            <p className="text-lg font-body italic text-white/90 leading-relaxed">
              "{content.description}"
            </p>
          </div>

          <div className="prose prose-invert prose-cyber max-w-none space-y-6">
            <h3 className="font-headline text-cyber-magenta text-sm tracking-widest uppercase flex items-center gap-3">
              <Zap size={16} /> Transmission_Body
            </h3>
            <div 
              className="font-body text-lg leading-relaxed text-white/70 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </div>

          <div className="pt-10">
            <button
              onClick={() => setIntelOpen(true)}
              className="inline-flex items-center justify-center gap-4 px-10 py-5 bg-cyber-magenta/10 border border-cyber-magenta/30 hover:bg-cyber-magenta hover:text-black transition-all font-headline text-xs tracking-[0.3em] uppercase group"
            >
              ACCESS_FULL_INTEL <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <Dialog open={intelOpen} onOpenChange={setIntelOpen}>
            <DialogContent className="glass-hud border-cyber-magenta/40 bg-black/95 text-white max-w-sm text-center">
              <DialogHeader className="items-center space-y-4 pt-2">
                <div className="w-16 h-16 border-2 border-cyber-magenta/50 flex items-center justify-center mx-auto relative">
                  <Lock size={28} className="text-cyber-magenta" />
                  <div className="absolute inset-0 bg-cyber-magenta/5 animate-pulse" />
                </div>
                <DialogTitle className="font-headline text-cyber-magenta tracking-[0.3em] text-xl">
                  <GlitchText text="COMING_SOON" />
                </DialogTitle>
                <DialogDescription className="text-white/60 font-mono text-sm leading-relaxed">
                  This transmission is still being assembled.<br />
                  Stand by for the full intel drop.
                </DialogDescription>
              </DialogHeader>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyber-magenta/40 to-transparent mt-2 mb-4" />
              <p className="font-headline text-[9px] tracking-[0.4em] text-white/20 uppercase pb-2">
                Signal locked — transmission pending
              </p>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
