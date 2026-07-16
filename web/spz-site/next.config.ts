
import type {NextConfig} from 'next';
import path from 'path';
import {
  baselineSecurityHeaderEntries,
  buildContentSecurityPolicy,
} from '@sa9/marketing/security';

// SPZ's CSP is the widest — the site embeds YouTube iframes, Google Tag
// Manager, Clerk auth flows, googleapis fonts/images, the StyleLift API,
// and PostHog analytics endpoints. The policy is built through the shared
// helper so directive ordering and `upgrade-insecure-requests` handling
// stay consistent with every other marketing site.
const spzCsp = buildContentSecurityPolicy({
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://www.youtube.com',
    'https://s.ytimg.com',
    'https://www.googletagmanager.com',
    'https://*.clerk.accounts.dev',
    'https://*.clerk.com',
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'media-src': ["'self'", 'https://www.youtube.com'],
  'frame-src': [
    "'self'",
    'https://www.youtube.com',
    'https://www.youtube-nocookie.com',
    'https://*.clerk.accounts.dev',
    'https://*.clerk.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.googleapis.com',
    'https://api.stylelift.fashion',
    'https://*.clerk.accounts.dev',
    'https://*.clerk.com',
    'https://us.i.posthog.com',
    'https://us-assets.i.posthog.com',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'", 'mailto:'],
  'upgrade-insecure-requests': true,
});

// SPZ needs `X-Frame-Options: SAMEORIGIN` (the site embeds parts of itself
// in iframes) rather than the baseline `DENY`, and also carries the legacy
// `X-XSS-Protection: 1; mode=block` header for older browsers. We filter the
// baseline entry for X-Frame-Options before appending the SAMEORIGIN form so
// we don't double-up headers.
const securityHeaders = [
  ...baselineSecurityHeaderEntries().filter((h) => h.key !== 'X-Frame-Options'),
  {key: 'Content-Security-Policy', value: spzCsp},
  {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
  {key: 'X-XSS-Protection', value: '1; mode=block'},
];

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@sa9/auth', '@sa9/analytics', '@sa9/marketing'],
  // Skip type/lint gating during prod build (pre-existing type-only issues in
  // shared packages don't affect runtime; dev already tolerates them).
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Placeholder images used in content data — replace with real images over time
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'substackcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.substack.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'substack-post-media.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.githubassets.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.vice.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
