
export type PaletteVariant = 'Magenta' | 'Cyan';

export type ContentType = 'Brand' | 'Book' | 'Music' | 'Podcast' | 'Social' | 'Article';

export interface BaseContent {
  id: string;
  title: string;
  timestamp: string; // ISO Date
  slug: string;
  type: ContentType;
  subtype?: string; // Original content_type (e.g., 'press', 'video press', 'patent')
  topicTags: string[];
  coverImage: string;
  paletteVariant: PaletteVariant;
  description: string;
  content?: string; // Long form content
  alias?: string; // Author alias / pseudonym
}

export interface BrandWork extends BaseContent {
  type: 'Brand';
  client: string;
  role?: string;
  period?: string;
  location?: string;
  phases: {
    name: string;
    period?: string;
    content: string;
    media: string[];
  }[];
}

export interface BookContent extends BaseContent {
  type: 'Book';
  amazonLink?: string;
  url?: string;
  snippets?: string[];
  conceptArt?: string[];
  authorNotes?: string;
  status?: string;
  author?: string;
  htmlContent?: string;
}

export interface MusicContent extends BaseContent {
  type: 'Music';
  spotifyLink: string;
  appleMusicLink: string;
  appleMusicEmbedUrl?: string;
  youtubeLink?: string;
  gallery?: string[];
  lyrics: Record<string, string>; // trackName: lyrics
  tracks: { title: string; duration: string }[];
}

export interface PodcastContent extends BaseContent {
  type: 'Podcast';
  guestBio: string;
  rssLink: string;
  episodeId: string;
}

export interface ArticleContent extends BaseContent {
  type: 'Article';
  substackUrl: string;
  readingTime?: number;
  htmlContent?: string;
  author?: string;
  summary?: string;
  seo_keywords?: string[];
  rss_guid?: string;
  youtube_id?: string;
}

export interface SocialContent extends BaseContent {
  type: 'Social';
  platform: 'Twitter' | 'Instagram' | 'LinkedIn' | 'Substack' | 'GitHub' | 'Facebook';
  url: string;
}
