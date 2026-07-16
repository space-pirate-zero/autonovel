import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Space Pirate Zero',
    short_name: 'SPZ',
    description: 'Digital headquarters of Greg Chambers — AI writer, inventor, enterprise strategist, music producer.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#00FFFF',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
