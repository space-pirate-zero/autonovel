import { MetadataRoute } from 'next';
import { getAllContent } from '@/lib/content-loader';

const PRIORITY: Record<string, number> = {
  article:       0.8,
  book:          0.75,
  'video press': 0.85,
  'video-press': 0.85,
  'video_press': 0.85,
  press:         0.72,
  patent:        0.6,
  brand:         0.7,
  music:         0.65,
  social:        0.5,
};

const FREQUENCY: Record<string, MetadataRoute.Sitemap[number]['changeFrequency']> = {
  article:       'weekly',
  book:          'monthly',
  press:         'monthly',
  'video press': 'monthly',
  'video-press': 'monthly',
  'video_press': 'monthly',
  patent:        'yearly',
  brand:         'monthly',
  social:        'monthly',
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.spacepiratezero.com';
  const allContent = await getAllContent();

  const contentRoutes = allContent.map((item) => ({
    url: `${baseUrl}/content/${item.type.toLowerCase()}/${item.slug}`,
    lastModified: new Date(item.timestamp),
    changeFrequency: FREQUENCY[item.subtype || ''] ?? 'monthly',
    priority: PRIORITY[item.subtype || ''] ?? 0.65,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/content/article`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  return [...staticRoutes, ...contentRoutes];
}
