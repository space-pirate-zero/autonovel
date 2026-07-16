'use client';

import { PodcastContent } from '@/types/content';
import { Rss, ExternalLink, ArrowLeft, Mic } from 'lucide-react';
import Link from 'next/link';

interface PodcastContentDisplayProps {
  content: PodcastContent;
}

export function PodcastContentDisplay({ content }: PodcastContentDisplayProps) {
  return (
    <div className="min-h-screen bg-cyber-black text-white px-6 py-12 md:px-16">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Back nav */}
        <Link
          href="/content/podcast"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] font-headline text-white/40 hover:text-cyber-cyan transition-colors uppercase"
        >
          <ArrowLeft size={12} /> PODCAST_ARCHIVE
        </Link>

        {/* Header */}
        <div className="space-y-4 border-b border-cyber-cyan/20 pb-8">
          <div className="text-[10px] tracking-[0.3em] font-headline text-cyber-cyan uppercase flex items-center gap-2">
            <Mic size={12} />
            TRANSMISSION // PODCAST
          </div>
          <h1 className="font-headline text-3xl md:text-4xl tracking-tight text-white leading-tight">
            {content.title}
          </h1>
          <p className="font-mono text-xs text-white/40">
            {new Date(content.timestamp).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).toUpperCase()}
          </p>
        </div>

        {/* Guest Bio */}
        {content.guestBio && (
          <div className="border-l-2 border-cyber-cyan/40 pl-6 space-y-2">
            <div className="text-[10px] tracking-[0.25em] font-headline text-cyber-cyan uppercase">
              GUEST_SIGNAL
            </div>
            <p className="font-mono text-sm text-white/60 leading-relaxed">
              {content.guestBio}
            </p>
          </div>
        )}

        {/* Description */}
        {content.description && (
          <div className="space-y-2">
            <div className="text-[10px] tracking-[0.25em] font-headline text-white/30 uppercase">
              EPISODE_BRIEF
            </div>
            <p className="font-mono text-sm text-white/60 leading-relaxed">
              {content.description}
            </p>
          </div>
        )}

        {/* Episode Player placeholder */}
        <div className="border border-cyber-cyan/20 glass-hud p-8 space-y-4 text-center">
          <div className="text-[10px] tracking-[0.25em] font-headline text-cyber-cyan uppercase">
            AUDIO_STREAM // EPISODE_{content.episodeId}
          </div>
          <p className="font-mono text-xs text-white/30">
            Embed player not configured for this episode.
          </p>
        </div>

        {/* RSS Link */}
        {content.rssLink && (
          <div>
            <a
              href={content.rssLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-cyber-cyan/30 px-6 py-3 font-headline text-[11px] tracking-[0.2em] text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
            >
              <Rss size={14} />
              RSS_FEED
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {/* Tags */}
        {content.topicTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
            {content.topicTags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] px-3 py-1 border border-cyber-cyan/20 text-cyber-cyan/60 tracking-wider"
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
