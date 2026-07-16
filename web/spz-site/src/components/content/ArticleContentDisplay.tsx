
'use client';

import { ArticleContent } from '@/types/content';
import { GlitchText } from '../hud/GlitchText';
import {
  Calendar,
  Clock,
  User,
  ExternalLink,
  Share2,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Bell,
  ArrowLeft,
  FileText,
  Youtube,
  Tag,
  Hash,
  Rss
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface ArticleContentDisplayProps {
  content: ArticleContent;
}

function domainLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'EXTERNAL_SOURCE';
  }
}

/** Convert Substack's image-gallery-embed divs into plain <figure> + <img> tags */
function preprocessHtml(html: string): string {
  return html.replace(
    /<div[^>]+class="image-gallery-embed"[^>]+data-attrs="([^"]+)"[^>]*>[\s\S]*?<\/div>/g,
    (_, rawAttrs) => {
      try {
        const decoded = rawAttrs
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');
        const data = JSON.parse(decoded);
        const images: { src: string }[] = data.gallery?.images || [];
        const caption: string = data.gallery?.caption || '';
        if (!images.length) return '';
        const imgTags = images
          .map(img => `<img src="${img.src}" alt="${caption || 'Gallery image'}" loading="lazy" />`)
          .join('');
        return `<figure class="substack-gallery">${imgTags}${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
      } catch {
        return '';
      }
    }
  );
}

export function ArticleContentDisplay({ content }: ArticleContentDisplayProps) {
  const isCyan = content.paletteVariant === 'Cyan';
  const isPress = content.subtype === 'press' || content.subtype?.includes('video');
  const isVideo = content.subtype?.includes('video');
  const isPatent = content.subtype === 'patent';

  const [currentUrl, setCurrentUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState<'local' | 'origin' | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>('');

  const fallbackHtml = useMemo(
    () =>
      preprocessHtml(content.htmlContent || '') ||
      `<p class="italic text-white/40">Archival body content is being decrypted. Stand by for transmission...</p>`,
    [content.htmlContent]
  );
  const [sanitizedHtml, setSanitizedHtml] = useState(fallbackHtml);

  useEffect(() => {
    import('dompurify').then(({ default: DOMPurify }) => {
      setSanitizedHtml(
        DOMPurify.sanitize(fallbackHtml, { ADD_ATTR: ['loading'], ADD_TAGS: ['figure', 'figcaption'] })
      );
    });
  }, [fallbackHtml]);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    try {
      setFormattedDate(format(new Date(content.timestamp), 'yyyy.MM.dd'));
    } catch (e) {
      setFormattedDate('####.##.##');
    }
  }, [content.timestamp]);

  const handleCopy = (url: string, type: 'local' | 'origin') => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopiedLink(type);
      toast({
        title: "LINK_COPIED",
        description: `Target frequency saved to clipboard.`,
      });
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const shareOnSocial = (platform: string, url: string) => {
    const text = encodeURIComponent(`Transmission from Space Pirate Zero: ${content.title}`);
    const encodedUrl = encodeURIComponent(url);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const isPreviewOnly = !isPress && !!(content.htmlContent?.includes('&#8230;') || content.htmlContent?.includes('\u2026'));

  const subtypeLabel = isPatent ? 'PATENT' : isVideo ? 'VIDEO_PRESS' : isPress ? 'PRESS' : 'ARTICLE';
  const originLabel = isVideo ? 'ORIGIN_VIDEO_LOG' : isPress ? 'ORIGIN_PRESS_SOURCE' : 'ORIGIN_SUBSTACK_LINK';
  const externalButtonLabel = isVideo ? 'VIEW_ON_YOUTUBE' : isPress ? 'ACCESS_SOURCE' : 'SUBSTACK_UPLINK';
  const externalDomain = content.substackUrl ? domainLabel(content.substackUrl).toUpperCase() : subtypeLabel;

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10">
      {/* Return Path */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[10px] font-headline text-white/40 hover:text-cyber-cyan transition-colors uppercase tracking-[0.2em] group"
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        Return_to_Command_Center
      </Link>

      {/* Header Section */}
      <div className="space-y-6">
        <div className={cn(
          "font-headline text-[10px] tracking-[0.3em] uppercase",
          isCyan ? 'text-cyber-cyan' : 'text-cyber-magenta'
        )}>
          ARCHIVE_NODE // {subtypeLabel} // {content.id}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline text-white leading-tight break-words overflow-wrap-anywhere">
          <GlitchText text={content.title} />
        </h1>

        <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-mono text-white/50 uppercase tracking-widest border-y border-white/10 py-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className={isCyan ? 'text-cyber-cyan' : 'text-cyber-magenta'} />
            {formattedDate}
          </div>
          <div className="flex items-center gap-2">
            <User size={14} className={isCyan ? 'text-cyber-cyan' : 'text-cyber-magenta'} />
            {content.author || 'GREG CHAMBERS'}
            {content.alias && (
              <span className="text-white/30 ml-1">/ {content.alias}</span>
            )}
          </div>
          {content.readingTime && !isVideo && !isPatent && (
            <div className="flex items-center gap-2">
              <Clock size={14} className={isCyan ? 'text-cyber-cyan' : 'text-cyber-magenta'} />
              {content.readingTime} MIN_READ
            </div>
          )}
        </div>

        {/* Top Sharing & Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="glass-hud p-4 border border-white/5 space-y-3">
            <div className="text-[9px] font-headline text-cyber-cyan tracking-widest uppercase flex items-center gap-2">
              <Share2 size={10} /> SHARE_THIS_PAGE
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => shareOnSocial('twitter', currentUrl)} className="h-8 w-8 hover:bg-cyber-cyan/10 hover:text-cyber-cyan border-white/10">
                <Twitter size={14} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => shareOnSocial('linkedin', currentUrl)} className="h-8 w-8 hover:bg-cyber-cyan/10 hover:text-cyber-cyan border-white/10">
                <Linkedin size={14} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleCopy(currentUrl, 'local')} className="h-8 w-8 hover:bg-cyber-cyan/10 hover:text-cyber-cyan border-white/10">
                {copiedLink === 'local' ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>

          <div className="glass-hud p-4 border border-white/5 space-y-3">
            <div className={cn(
              "text-[9px] font-headline tracking-widest uppercase flex flex-wrap items-center gap-x-2 gap-y-1",
              isCyan ? 'text-cyber-cyan' : 'text-cyber-magenta'
            )}>
              <span className="shrink-0">{isVideo ? <Youtube size={10} /> : <ExternalLink size={10} />}</span>
              <span>{originLabel}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => shareOnSocial('twitter', content.substackUrl)} className={cn("h-8 w-8 border-white/10", isCyan ? 'hover:bg-cyber-cyan/10 hover:text-cyber-cyan' : 'hover:bg-cyber-magenta/10 hover:text-cyber-magenta')} disabled={!content.substackUrl}>
                <Twitter size={14} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => shareOnSocial('linkedin', content.substackUrl)} className={cn("h-8 w-8 border-white/10", isCyan ? 'hover:bg-cyber-cyan/10 hover:text-cyber-cyan' : 'hover:bg-cyber-magenta/10 hover:text-cyber-magenta')} disabled={!content.substackUrl}>
                <Linkedin size={14} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleCopy(content.substackUrl, 'origin')} className={cn("h-8 w-8 border-white/10", isCyan ? 'hover:bg-cyber-cyan/10 hover:text-cyber-cyan' : 'hover:bg-cyber-magenta/10 hover:text-cyber-magenta')} disabled={!content.substackUrl}>
                {copiedLink === 'origin' ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>

          <div className="glass-hud border border-cyber-cyan/30">
            {isPress ? (
              <a
                href={content.substackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full min-h-[4.5rem] flex flex-wrap items-center justify-center gap-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/20 transition-all font-headline text-[10px] tracking-widest uppercase group px-4 py-3"
              >
                <ExternalLink size={14} className="shrink-0 group-hover:animate-bounce" />
                <span className="text-center">{externalButtonLabel}</span>
              </a>
            ) : (
              <a
                href="https://spacepiratezero.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full min-h-[4.5rem] flex flex-wrap items-center justify-center gap-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/20 transition-all font-headline text-[10px] tracking-widest uppercase group px-4 py-3"
              >
                <Bell size={14} className="shrink-0 group-hover:animate-bounce" />
                <span className="text-center">SUBSCRIBE ON SUBSTACK</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Hero: YouTube embed for video press, static image otherwise */}
      {isVideo && content.youtube_id ? (
        <div className={cn(
          "relative aspect-video border-2 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]",
          isCyan ? 'border-cyber-cyan/30' : 'border-cyber-magenta/30'
        )}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${content.youtube_id}`}
            title={content.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className={cn(
          "relative aspect-video border-2 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]",
          isCyan ? 'border-cyber-cyan/30' : 'border-cyber-magenta/30'
        )}>
          <Image
            src={content.coverImage}
            alt={content.title}
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          <div className={cn(
            "absolute bottom-4 right-4 h-1 w-24 animate-pulse",
            isCyan ? 'bg-cyber-cyan' : 'bg-cyber-magenta'
          )} />
        </div>
      )}

      {/* Editorial Briefing (summary) */}
      {(content.summary || content.description) && (
        <div className="glass-hud p-8 border-l-4 border-cyber-magenta bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-cyber-magenta/20 animate-scanline" />
          <div className="text-[10px] font-headline text-cyber-magenta mb-4 tracking-[0.3em] uppercase flex items-center gap-2">
            <FileText size={12} /> Editorial_Briefing
          </div>
          <p className="text-xl md:text-2xl font-body italic text-white/90 leading-relaxed">
            "{content.summary || content.description}"
          </p>
        </div>
      )}

      {/* Content Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3">
          <article
            className="prose prose-invert prose-cyber max-w-none
              font-body text-xl md:text-2xl leading-relaxed text-white/85
              prose-headings:font-headline prose-headings:text-white
              prose-a:text-cyber-cyan prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-img:border prose-img:border-white/10
              custom-html-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />

          {isPress && (
            <div className="mt-12 p-6 glass-hud border border-white/5 bg-white/5 rounded-sm">
              <div className="text-[10px] font-headline text-cyber-cyan mb-4 tracking-widest uppercase">Direct_Uplink_Required</div>
              <p className="text-sm font-mono text-white/60 mb-6">Full archival data for press transmissions must be accessed via the original origin point.</p>
              <a
                href={content.substackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-cyber-cyan text-black font-headline text-[10px] tracking-widest uppercase hover:bg-cyber-cyan/80 transition-all"
              >
                {externalButtonLabel} <ExternalLink size={12} />
              </a>
            </div>
          )}

          {isPreviewOnly && content.substackUrl && (
            <div className="mt-12 glass-hud border border-cyber-cyan/30 bg-black/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyber-cyan via-cyber-magenta to-transparent" />
              <div className="p-8 space-y-5">
                <div className="text-[9px] font-headline text-cyber-cyan tracking-[0.3em] uppercase">
                  ▶ TRANSMISSION_INTERRUPTED // SUBSCRIBER_CLEARANCE_REQUIRED
                </div>
                <p className="font-mono text-sm text-white/60 leading-relaxed max-w-lg">
                  This dispatch is classified for paid subscribers. Full access — including the complete transmission, deep analysis, and the parts that didn&apos;t make it past the editors — lives on Substack.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={content.substackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-cyan text-black font-headline text-[10px] tracking-widest uppercase hover:bg-cyber-cyan/80 transition-all"
                  >
                    <ExternalLink size={12} /> READ_FULL_TRANSMISSION
                  </a>
                  <a
                    href="https://spacepiratezero.substack.com/subscribe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-cyber-magenta/50 text-cyber-magenta font-headline text-[10px] tracking-widest uppercase hover:bg-cyber-magenta/10 transition-all"
                  >
                    <Bell size={12} /> SUBSCRIBE_FOR_ACCESS
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-hud p-6 border-l-2 border-cyber-cyan sticky top-32 space-y-6">
            {/* Tags */}
            {content.topicTags && content.topicTags.length > 0 && (
              <div>
                <div className="text-[10px] font-headline text-cyber-cyan mb-3 tracking-widest uppercase">Metadata_Stream</div>
                <div className="space-y-2">
                  {content.topicTags.map(tag => (
                    <div key={tag} className="text-xs font-mono text-white/40">
                      <span className="text-cyber-magenta mr-2">#</span>{tag.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Keywords */}
            {content.seo_keywords && content.seo_keywords.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] font-headline text-white/40 mb-3 tracking-widest uppercase flex items-center gap-2">
                  <Tag size={10} /> SEO_SIGNALS
                </div>
                <div className="flex flex-wrap gap-1">
                  {content.seo_keywords.slice(0, 6).map(kw => (
                    <span key={kw} className="text-[8px] font-mono text-white/25 bg-white/5 px-1.5 py-0.5 border border-white/10">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* RSS GUID */}
            {content.rss_guid && (
              <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] font-headline text-white/40 mb-2 tracking-widest uppercase flex items-center gap-2">
                  <Rss size={10} /> RSS_GUID
                </div>
                <div className="text-[8px] font-mono text-white/20 break-all leading-relaxed">
                  {content.rss_guid}
                </div>
              </div>
            )}

            {/* External Uplink */}
            <div className="pt-4 border-t border-white/5">
              <div className="text-[10px] font-headline text-white/40 mb-3 uppercase tracking-widest">External_Uplink</div>
              <a
                href={content.substackUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-start justify-between gap-2 w-full p-3 bg-white/5 border border-white/10 transition-all font-headline text-[10px] tracking-widest uppercase group",
                  content.substackUrl ? "hover:border-cyber-magenta hover:text-cyber-magenta" : "opacity-20 cursor-not-allowed"
                )}
              >
                <span className="break-all min-w-0">{externalDomain}</span>
                <ExternalLink size={12} className="shrink-0 mt-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
