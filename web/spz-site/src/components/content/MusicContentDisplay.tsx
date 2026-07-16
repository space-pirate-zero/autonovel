'use client';

import { MusicContent } from '@/types/content';
import { GlitchText } from '../hud/GlitchText';
import {
  Music,
  Disc,
  ListMusic,
  Share2,
  Mic2,
  Calendar,
  Layers,
  Volume2,
  Twitter,
  Linkedin,
  Copy,
  Check,
  UserPlus,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MusicContentDisplayProps {
  content: MusicContent;
}

const APPLE_ARTIST_URL = 'https://music.apple.com/us/artist/space-pirate-zero/1751347344';
const SPOTIFY_ARTIST_URL = 'https://open.spotify.com/artist/5hsu0KPjwVKMCx1hAMFvI4';

function spotifyEmbedUrl(link: string): string {
  return link.replace('open.spotify.com/', 'open.spotify.com/embed/') + '?utm_source=generator&theme=0';
}

function youtubeEmbedUrl(link: string): string {
  const shortMatch = link.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const longMatch = link.match(/[?&]v=([^&]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  return link;
}

export function MusicContentDisplay({ content }: MusicContentDisplayProps) {
  const isCyan = content.paletteVariant === 'Cyan';
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [player, setPlayer] = useState<'apple' | 'spotify' | 'youtube'>('spotify');
  const [copied, setCopied] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
    try {
      setFormattedDate(format(new Date(content.timestamp), 'yyyy.MM.dd'));
    } catch {
      setFormattedDate('####.##.##');
    }
  }, [content.timestamp]);

  const handleCopy = (url: string, key: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopied(key);
      toast({ title: 'LINK_COPIED', description: 'Frequency saved to clipboard.' });
      setTimeout(() => setCopied(null), 2000);
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

  const hasAppleEmbed = !!content.appleMusicEmbedUrl;
  const hasSpotifyEmbed = !!content.spotifyLink;
  const hasYoutube = !!content.youtubeLink;
  const activeEmbedUrl = player === 'apple' && hasAppleEmbed
    ? content.appleMusicEmbedUrl
    : player === 'youtube' && hasYoutube
      ? youtubeEmbedUrl(content.youtubeLink!)
      : hasSpotifyEmbed
        ? spotifyEmbedUrl(content.spotifyLink)
        : null;

  const accentColor = isCyan ? 'text-sa9-cyan' : 'text-sa9-pink';
  const borderAccent = isCyan ? 'border-sa9-cyan' : 'border-sa9-pink';
  const glowShadow = isCyan
    ? 'shadow-[0_0_12px_rgba(0,240,255,0.3),4px_4px_0_var(--sa9-cyan-shadow)]'
    : 'shadow-[0_0_12px_rgba(255,20,147,0.3),4px_4px_0_var(--sa9-pink-shadow)]';
  const hoverGlow = isCyan
    ? 'hover:shadow-[0_0_20px_rgba(0,240,255,0.4),0_0_40px_rgba(0,240,255,0.15)]'
    : 'hover:shadow-[0_0_20px_rgba(255,20,147,0.4),0_0_40px_rgba(255,20,147,0.15)]';

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4 md:px-0">

      {/* Return */}
      <Link
        href="/"
        className={cn(
          "inline-flex items-center gap-2 text-[10px] font-display text-sa9-text-dim hover:text-sa9-cyan transition-colors uppercase tracking-[0.2em] group",
          "border-3 border-sa9-border px-4 py-2 hover:border-sa9-cyan shadow-[var(--shadow-sm)]"
        )}
      >
        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
        Return_to_Command_Center
      </Link>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end">

        {/* Album art */}
        <div className={cn(
          'relative w-48 sm:w-56 md:w-64 lg:w-72 aspect-square border-3 group overflow-hidden shrink-0',
          borderAccent,
          glowShadow,
        )}>
          <Image
            src={content.coverImage}
            alt={content.title}
            fill
            unoptimized
            className="object-cover transition-all duration-700"
          />
          <div className={cn(
            'absolute top-2.5 left-2.5 p-1.5 bg-sa9-surface/80 backdrop-blur-md border-3',
            borderAccent,
          )}>
            <Music size={14} className={accentColor} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-sa9-cyan/30 animate-scanline" />
        </div>

        {/* Title + meta + action buttons */}
        <div className="flex-grow space-y-5 min-w-0">
          <div className={cn('font-display text-[10px] tracking-[0.4em] uppercase', accentColor)}>
            AUDIO_ARCHIVE_NODE // {content.id}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-sa9-text leading-none tracking-tighter break-words">
            <GlitchText text={content.title} />
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono text-sa9-text-muted uppercase tracking-widest bg-sa9-surface-raised px-4 py-3 border-3 border-sa9-border shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2">
              <Calendar size={12} className={accentColor} />
              {formattedDate || '...'}
            </div>
            <div className="flex items-center gap-2">
              <Disc size={12} className={accentColor} />
              {content.tracks.length} TRACKS
            </div>
            <div className="flex items-center gap-2">
              <Layers size={12} className={accentColor} />
              {content.topicTags.join(' // ')}
            </div>
          </div>

          {/* Platform links — NEON-framed with platform accent icons */}
          <div className="flex flex-wrap gap-3">
            {content.spotifyLink && (
              <a
                href={content.spotifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 px-4 h-10 border-3 font-display text-[10px] tracking-widest uppercase group transition-all shadow-[var(--shadow-sm)]",
                  "border-sa9-border bg-sa9-surface-raised text-sa9-text-muted",
                  "hover:border-sa9-pink hover:text-sa9-pink hover:shadow-[0_0_12px_rgba(255,20,147,0.3),4px_4px_0_var(--sa9-pink-shadow)]"
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954" className="shrink-0">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                LISTEN ON SPOTIFY
              </a>
            )}
            {content.appleMusicLink && (
              <a
                href={content.appleMusicLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 px-4 h-10 border-3 font-display text-[10px] tracking-widest uppercase group transition-all shadow-[var(--shadow-sm)]",
                  "border-sa9-border bg-sa9-surface-raised text-sa9-text-muted",
                  "hover:border-sa9-cyan hover:text-sa9-cyan hover:shadow-[0_0_12px_rgba(0,240,255,0.3),4px_4px_0_var(--sa9-cyan-shadow)]"
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FC3C44" className="shrink-0">
                  <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.048-2.31-2.17-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1 4.826 4.826 0 001.83-.6 4.945 4.945 0 001.922-2.04c.272-.517.397-1.075.46-1.644.07-.63.09-1.262.09-1.895V6.124zM12.75 16.063c0 .67-.53 1.2-1.2 1.2h-.01c-.664 0-1.196-.53-1.196-1.2V7.938c0-.664.532-1.194 1.196-1.194h.01c.666 0 1.2.53 1.2 1.194v8.125z" />
                </svg>
                LISTEN ON APPLE MUSIC
              </a>
            )}
          </div>

          {/* Follow + Share row */}
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={SPOTIFY_ARTIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 h-8 bg-sa9-surface-raised border-3 border-sa9-border hover:border-sa9-pink hover:text-sa9-pink transition-all font-display text-[10px] tracking-widest uppercase text-sa9-text-dim shadow-[var(--shadow-sm)] hover:shadow-[0_0_8px_rgba(255,20,147,0.2)]"
            >
              <UserPlus size={11} className="shrink-0" /> FOLLOW ON SPOTIFY
            </a>
            <a
              href={APPLE_ARTIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 h-8 bg-sa9-surface-raised border-3 border-sa9-border hover:border-sa9-cyan hover:text-sa9-cyan transition-all font-display text-[10px] tracking-widest uppercase text-sa9-text-dim shadow-[var(--shadow-sm)] hover:shadow-[0_0_8px_rgba(0,240,255,0.2)]"
            >
              <UserPlus size={11} className="shrink-0" /> FOLLOW ON APPLE MUSIC
            </a>
            <Button
              variant="outline"
              onClick={shareOnX}
              className="h-8 px-3 border-3 border-sa9-border hover:border-sa9-cyan hover:text-sa9-cyan font-display text-[10px] tracking-widest uppercase bg-sa9-surface-raised shadow-[var(--shadow-sm)] hover:shadow-[0_0_8px_rgba(0,240,255,0.2)]"
            >
              <Twitter size={11} className="mr-1.5" /> SHARE
            </Button>
            <Button
              variant="outline"
              onClick={shareOnLinkedIn}
              className="h-8 px-3 border-3 border-sa9-border hover:border-sa9-cyan hover:text-sa9-cyan font-display text-[10px] tracking-widest uppercase bg-sa9-surface-raised shadow-[var(--shadow-sm)] hover:shadow-[0_0_8px_rgba(0,240,255,0.2)]"
            >
              <Linkedin size={11} className="mr-1.5" /> SHARE
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCopy(currentUrl, 'page')}
              className="h-8 px-3 border-3 border-sa9-border hover:border-sa9-cyan hover:text-sa9-cyan font-display text-[10px] tracking-widest uppercase bg-sa9-surface-raised shadow-[var(--shadow-sm)] hover:shadow-[0_0_8px_rgba(0,240,255,0.2)]"
            >
              {copied === 'page' ? <Check size={11} className="mr-1.5" /> : <Copy size={11} className="mr-1.5" />}
              COPY LINK
            </Button>
          </div>
        </div>
      </div>

      {/* ── WARNING STRIPE DIVIDER ── */}
      <div className="warning-stripes" />

      {/* ── PLAYER ─────────────────────────────────────────────────────── */}
      <div className="space-y-0">
        {/* Player tab switcher */}
        <div className="flex items-center gap-0 border-b-3 border-sa9-border">
          <div className="font-display text-[9px] text-sa9-text-dim tracking-widest uppercase px-4 py-2 mr-2">
            <Volume2 size={12} className="inline mr-1 animate-neon-pulse text-sa9-cyan" />
            STREAM_SOURCE:
          </div>
          {hasSpotifyEmbed && (
            <button
              onClick={() => setPlayer('spotify')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 font-display text-[10px] tracking-widest uppercase border-b-3 transition-all',
                player === 'spotify'
                  ? 'border-sa9-pink text-sa9-pink shadow-[0_2px_8px_rgba(255,20,147,0.3)]'
                  : 'border-transparent text-sa9-text-dim hover:text-sa9-text-muted',
              )}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={player === 'spotify' ? '#1DB954' : 'currentColor'}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
              SPOTIFY
            </button>
          )}
          {hasAppleEmbed && (
            <button
              onClick={() => setPlayer('apple')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 font-display text-[10px] tracking-widest uppercase border-b-3 transition-all',
                player === 'apple'
                  ? 'border-sa9-cyan text-sa9-cyan shadow-[0_2px_8px_rgba(0,240,255,0.3)]'
                  : 'border-transparent text-sa9-text-dim hover:text-sa9-text-muted',
              )}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={player === 'apple' ? '#FC3C44' : 'currentColor'}><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.048-2.31-2.17-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1 4.826 4.826 0 001.83-.6 4.945 4.945 0 001.922-2.04c.272-.517.397-1.075.46-1.644.07-.63.09-1.262.09-1.895V6.124zM12.75 16.063c0 .67-.53 1.2-1.2 1.2h-.01c-.664 0-1.196-.53-1.196-1.2V7.938c0-.664.532-1.194 1.196-1.194h.01c.666 0 1.2.53 1.2 1.194v8.125z" /></svg>
              APPLE MUSIC
            </button>
          )}
          {hasYoutube && (
            <button
              onClick={() => setPlayer('youtube')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 font-display text-[10px] tracking-widest uppercase border-b-3 transition-all',
                player === 'youtube'
                  ? 'border-sa9-pink text-sa9-pink shadow-[0_2px_8px_rgba(255,20,147,0.3)]'
                  : 'border-transparent text-sa9-text-dim hover:text-sa9-text-muted',
              )}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={player === 'youtube' ? '#FF0000' : 'currentColor'}><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
              YOUTUBE
            </button>
          )}
        </div>

        {/* Embed frame */}
        {activeEmbedUrl && (
          <div className="bg-sa9-surface-raised border-3 border-sa9-border border-t-0 relative overflow-hidden shadow-[var(--shadow-md)]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-sa9-cyan/10 animate-scanline pointer-events-none" />
            {player === 'spotify' ? (
              <iframe
                key={`spotify-${content.id}`}
                src={activeEmbedUrl}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ display: 'block', background: 'transparent' }}
              />
            ) : player === 'youtube' ? (
              <iframe
                key={`youtube-${content.id}`}
                src={activeEmbedUrl!}
                width="100%"
                height="450"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                style={{ display: 'block', background: '#000' }}
              />
            ) : (
              <iframe
                key={`apple-${content.id}`}
                allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                frameBorder="0"
                height="450"
                sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                src={activeEmbedUrl}
                style={{ width: '100%', display: 'block', background: 'transparent' }}
              />
            )}
          </div>
        )}
      </div>

      {/* ── WARNING STRIPE DIVIDER ── */}
      <div className="warning-stripes" />

      {/* ── TRACK LIST + DESCRIPTION ───────────────────────────────────── */}
      <div className={cn(
        'grid gap-6',
        Object.keys(content.lyrics).length > 0 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2',
      )}>

        {/* Track list */}
        <div className={Object.keys(content.lyrics).length > 0 ? 'lg:col-span-1' : ''}>
          <div className={cn('bg-sa9-surface-raised border-3 border-l-[6px] h-full shadow-[var(--shadow-md)]', borderAccent)}>
            <div className={cn('flex items-center gap-2 px-5 py-3 border-b-3 border-sa9-border font-display text-xs uppercase tracking-widest', accentColor)}>
              <ListMusic size={14} /> SEQUENCE_LIST
            </div>
            <div className="divide-y divide-sa9-border">
              {content.tracks.map((track, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between px-5 py-2.5 hover:bg-sa9-surface-overlay transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-[10px] text-sa9-text-dim shrink-0">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-display text-xs text-sa9-text-muted group-hover:text-sa9-text transition-colors truncate">
                      {track.title}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-sa9-text-dim shrink-0 ml-3">{track.duration}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t-3 border-sa9-border space-y-2">
              <div className="text-[9px] font-display text-sa9-text-dim uppercase tracking-[0.2em]">Archival_Description</div>
              <p className="text-sa9-text-muted text-xs font-mono leading-relaxed">{content.description}</p>
            </div>
          </div>
        </div>

        {/* Lyrics or instrumental note */}
        {Object.keys(content.lyrics).length > 0 ? (
          <div className="lg:col-span-2">
            <div className="bg-sa9-surface-raised p-8 md:p-10 border-3 border-sa9-border shadow-[var(--shadow-md)]">
              <h3 className={cn('font-display text-xs mb-8 uppercase tracking-widest flex items-center gap-2 border-b-3 border-sa9-border pb-3 w-fit', 'text-sa9-pink')}>
                <Mic2 size={14} /> LYRIC_ENCRYPTION
              </h3>
              <div className="space-y-14">
                {Object.entries(content.lyrics).map(([trackName, lyric]) => (
                  <div key={trackName} className="space-y-6">
                    <h4 className="font-display text-xs text-sa9-cyan flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-sa9-cyan animate-neon-pulse shrink-0" />
                      {trackName.toUpperCase()}
                    </h4>
                    <p className="whitespace-pre-wrap font-body text-xl md:text-2xl leading-relaxed text-sa9-text/80 italic tracking-wide font-light">
                      {lyric}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-sa9-surface-raised border-3 border-sa9-border h-full shadow-[var(--shadow-md)] flex flex-col items-center justify-center p-6 text-sa9-text-dim">
              <Disc size={28} className="mb-3 opacity-30" style={{ animation: 'spin 8s linear infinite' }} />
              <div className="font-display text-[10px] tracking-[0.4em] uppercase">INSTRUMENTAL</div>
              <div className="font-mono text-[9px] mt-1 opacity-40">No vocal data in this archive node.</div>
            </div>
          </div>
        )}
      </div>

      {/* ── WARNING STRIPE DIVIDER ── */}
      <div className="warning-stripes" />

      {/* ── GALLERY + ALL RELEASES ────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className={cn('font-display text-[10px] tracking-[0.3em] uppercase flex items-center gap-2', accentColor)}>
            <Share2 size={12} />
            {content.gallery && content.gallery.length > 0
              ? `GALLERY // ${content.gallery.length} TRANSMISSIONS`
              : 'DISCOGRAPHY'}
          </div>
          <a
            href={SPOTIFY_ARTIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-display text-sa9-text-dim hover:text-sa9-cyan transition-colors uppercase tracking-widest"
          >
            ALL RELEASES →
          </a>
        </div>

        {content.gallery && content.gallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {content.gallery.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'relative aspect-[4/3] border-3 group overflow-hidden shadow-[var(--shadow-sm)]',
                  isCyan ? 'border-sa9-border hover:border-sa9-cyan' : 'border-sa9-border hover:border-sa9-pink',
                  hoverGlow,
                )}
              >
                <Image
                  src={url}
                  alt={`${content.title} — photo ${idx + 1}`}
                  fill
                  unoptimized
                  className="object-cover transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-sa9-surface/20 group-hover:bg-transparent transition-colors duration-500" />
                <div className={cn('absolute bottom-2 right-2 font-mono text-[8px] opacity-0 group-hover:opacity-100 transition-opacity', accentColor)}>
                  {(idx + 1).toString().padStart(2, '0')} ↗
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
