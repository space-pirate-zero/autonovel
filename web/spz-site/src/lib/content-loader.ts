
import fs from 'fs/promises';
import path from 'path';
import { BaseContent, ContentType, ArticleContent, BookContent, MusicContent, SocialContent, BrandWork } from '@/types/content';
import { slugify } from '@/lib/utils';

const contentDirectory = path.join(process.cwd(), 'src', 'lib', 'content');

const TYPE_MAP: Record<string, ContentType> = {
  'article': 'Article',
  'press': 'Article',
  'video_press': 'Article',
  'video-press': 'Article',
  'video press': 'Article',
  'patent': 'Article',
  'music': 'Music',
  'book': 'Book',
  'brand': 'Brand',
  'social': 'Social'
};

let contentCache: BaseContent[] | null = null;

/** Represents a raw content item from the JSON data files before mapping. */
interface RawContentItem {
  id?: string | number;
  title?: string;
  publication_date?: string;
  slug?: string;
  content_type?: string;
  tags?: string[];
  image_url?: string;
  description?: string;
  summary?: string;
  alias?: string;
  url?: string;
  html_content?: string;
  content?: string;
  author?: string;
  reading_time?: number;
  seo_keywords?: string[];
  rss_guid?: string;
  youtube_id?: string;
  status?: string;
  amazon_link?: string;
  spotify_link?: string;
  apple_music_link?: string;
  apple_music_embed_url?: string;
  youtube_link?: string;
  gallery?: string[];
  lyrics?: Record<string, string>;
  tracks?: { title: string; duration: string }[];
  client?: string;
  role?: string;
  period?: string;
  location?: string;
  phases?: RawPhase[];
  platform?: string;
}

interface RawPhase {
  name?: string;
  period?: string;
  content?: string;
  media?: string[];
}

function extractYoutubeId(url: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : undefined;
}

function mapItem(item: RawContentItem, fileName: string, index: number): BaseContent {
  const contentTypeStr = (item.content_type || 'article').toLowerCase();
  const type = TYPE_MAP[contentTypeStr] || 'Article';

  const base: BaseContent = {
    id: item.id?.toString() ?? `${fileName}-${index}`,
    title: item.title || 'Untitled Transmission',
    timestamp: item.publication_date || new Date().toISOString(),
    slug: item.slug || slugify(item.title || 'untitled'),
    type: type,
    subtype: contentTypeStr,
    topicTags: item.tags || [],
    coverImage: item.image_url || `https://picsum.photos/seed/${item.id || 'default'}/800/600`,
    paletteVariant: (contentTypeStr === 'article' || type === 'Book') ? 'Magenta' : 'Cyan',
    description: item.description || item.summary || 'No archival description found.',
    alias: item.alias,
  };

  if (type === 'Article') {
    const youtubeId = item.youtube_id || extractYoutubeId(item.url || '');
    return {
      ...base,
      substackUrl: item.url || '',
      readingTime: item.reading_time || 5,
      htmlContent: item.html_content || item.content || '',
      author: item.author || 'Greg Chambers',
      summary: item.summary,
      seo_keywords: item.seo_keywords || item.tags || [],
      rss_guid: item.rss_guid || item.url || '',
      youtube_id: youtubeId,
    } as ArticleContent;
  }

  if (type === 'Book') {
    return {
      ...base,
      status: item.status || 'Archived',
      author: item.author || 'Greg Chambers',
      htmlContent: item.summary || item.description || '',
      url: item.url || '',
      amazonLink: item.amazon_link || item.url || ''
    } as BookContent;
  }

  if (type === 'Music') {
    return {
      ...base,
      spotifyLink: item.spotify_link || '',
      appleMusicLink: item.apple_music_link || '',
      appleMusicEmbedUrl: item.apple_music_embed_url || '',
      youtubeLink: item.youtube_link || undefined,
      gallery: item.gallery || undefined,
      lyrics: item.lyrics || {},
      tracks: item.tracks || [],
    } as MusicContent;
  }

  if (type === 'Brand') {
    return {
      ...base,
      client: item.client || item.title,
      role: item.role || '',
      period: item.period || '',
      location: item.location || '',
      phases: (item.phases || []).map((p: RawPhase) => ({
        name: p.name || '',
        period: p.period || '',
        content: p.content || '',
        media: p.media || [],
      })),
    } as BrandWork;
  }

  if (type === 'Social') {
    return {
      ...base,
      platform: item.platform || 'Instagram',
      url: item.url || '',
    } as SocialContent;
  }

  return base;
}

/**
 * Server-side function to get all content data from the local JSON archival nodes.
 * Reads index.json first (canonical source), then merges books.json, brands.json, music.json.
 * Deduplicates by ID. Implements in-memory caching to avoid repeated file system access.
 */
export const getAllContent = async (): Promise<BaseContent[]> => {
  if (contentCache) {
    return contentCache;
  }

  try {
    await fs.access(contentDirectory);
  } catch (e) {
    console.error('CONTENT_DIRECTORY_NOT_FOUND:', contentDirectory);
    return [];
  }

  const seenIds = new Set<string>();
  let allContent: BaseContent[] = [];

  // Priority files: index.json first (canonical dataset — articles + press + patents)
  const priorityFiles = ['index.json'];
  // Secondary files (separate datasets that remain independent)
  const secondaryFiles = ['books.json', 'brands.json', 'music.json'];
  // Excluded files (substack.json is a raw RSS mirror; index.json is the canonical article source)
  const excludedFiles = ['substack.json'];

  const allFileNames = await fs.readdir(contentDirectory);
  const orderedFiles = [
    ...priorityFiles.filter(f => allFileNames.includes(f)),
    ...secondaryFiles.filter(f => allFileNames.includes(f)),
    // Any remaining files not in the above lists (excluding raw mirrors)
    ...allFileNames.filter(
      f => f.endsWith('.json') && !priorityFiles.includes(f) && !secondaryFiles.includes(f) && !excludedFiles.includes(f)
    ),
  ];

  for (const fileName of orderedFiles) {
    if (!fileName.endsWith('.json')) continue;
    const filePath = path.join(contentDirectory, fileName);
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const rawItems: unknown = JSON.parse(fileContent);
      if (!Array.isArray(rawItems)) continue;
      const items = rawItems as RawContentItem[];

      const mappedItems = items
        .map((item, index) => mapItem(item, fileName, index))
        .filter(item => {
          if (seenIds.has(item.id)) return false;
          seenIds.add(item.id);
          return true;
        });

      allContent = [...allContent, ...mappedItems];
    } catch (e) {
      console.error(`FAILED_TO_PARSE_CONTENT_FILE: ${fileName}`, e);
    }
  }

  contentCache = allContent.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return contentCache;
};
