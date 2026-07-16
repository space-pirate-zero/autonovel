import { Platform, OAuthConfig } from "./types";

/**
 * Per-platform OAuth configuration.
 *
 * Environment variable naming convention:
 *   <PLATFORM_SLUG>_CLIENT_ID
 *   <PLATFORM_SLUG>_CLIENT_SECRET
 *
 * Where PLATFORM_SLUG is the screaming-snake-case of the platform key,
 * e.g. GOOGLE_SEARCH_CONSOLE_CLIENT_ID, META_ADS_CLIENT_ID.
 */
export const PLATFORM_CONFIGS: Record<Platform, OAuthConfig> = {
  [Platform.LinkedIn]: {
    name: "LinkedIn",
    description: "Connect to post content, analyze engagement, and manage company pages.",
    icon: "linkedin",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "email", "w_member_social", "r_organization_social"],
    clientIdEnvVar: "LINKEDIN_CLIENT_ID",
    clientSecretEnvVar: "LINKEDIN_CLIENT_SECRET",
  },

  [Platform.Reddit]: {
    name: "Reddit",
    description: "Monitor brand mentions, engage with communities, and track subreddit growth.",
    icon: "reddit",
    authUrl: "https://www.reddit.com/api/v1/authorize",
    tokenUrl: "https://www.reddit.com/api/v1/access_token",
    scopes: ["identity", "read", "submit", "mysubreddits"],
    clientIdEnvVar: "REDDIT_CLIENT_ID",
    clientSecretEnvVar: "REDDIT_CLIENT_SECRET",
  },

  [Platform.Bluesky]: {
    name: "Bluesky",
    description: "Post to the AT Protocol network, manage your Bluesky presence.",
    icon: "bluesky",
    // Not used — Bluesky uses app-password flow, not OAuth
    authUrl: "https://bsky.social/xrpc/com.atproto.server.createSession",
    tokenUrl: "https://bsky.social/xrpc/com.atproto.server.createSession",
    scopes: [],
    clientIdEnvVar: "BLUESKY_HANDLE",
    clientSecretEnvVar: "BLUESKY_APP_PASSWORD",
    customFlow: "atproto",
  },

  [Platform.Twitter]: {
    name: "X / Twitter",
    description: "Schedule tweets, track mentions, and analyze audience growth.",
    icon: "twitter",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientIdEnvVar: "TWITTER_CLIENT_ID",
    clientSecretEnvVar: "TWITTER_CLIENT_SECRET",
  },

  [Platform.Facebook]: {
    name: "Facebook",
    description: "Manage pages, schedule posts, and track Facebook engagement metrics.",
    icon: "facebook",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list", "public_profile"],
    clientIdEnvVar: "FACEBOOK_CLIENT_ID",
    clientSecretEnvVar: "FACEBOOK_CLIENT_SECRET",
  },

  [Platform.Instagram]: {
    name: "Instagram",
    description: "Publish content, manage comments, and track Instagram growth.",
    icon: "instagram",
    // Instagram Graph API uses Facebook's OAuth flow — not the Basic Display API
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish", "instagram_manage_comments", "pages_show_list"],
    clientIdEnvVar: "INSTAGRAM_CLIENT_ID",
    clientSecretEnvVar: "INSTAGRAM_CLIENT_SECRET",
  },

  [Platform.GoogleSearchConsole]: {
    name: "Google Search Console",
    description: "Monitor search performance, index coverage, and SEO insights.",
    icon: "google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/webmasters.readonly",
      "https://www.googleapis.com/auth/webmasters",
    ],
    clientIdEnvVar: "GOOGLE_SEARCH_CONSOLE_CLIENT_ID",
    clientSecretEnvVar: "GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET",
  },

  [Platform.MetaAds]: {
    name: "Meta Ads",
    description: "Manage ad campaigns, track spend, and optimize Meta advertising performance.",
    icon: "meta",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: ["ads_read", "ads_management", "business_management"],
    clientIdEnvVar: "META_ADS_CLIENT_ID",
    clientSecretEnvVar: "META_ADS_CLIENT_SECRET",
  },

  [Platform.MetaBusiness]: {
    name: "Meta Business",
    description: "Access Meta Business Suite, manage assets, and coordinate across Meta platforms.",
    icon: "meta",
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: ["business_management", "pages_manage_metadata", "pages_show_list"],
    clientIdEnvVar: "META_BUSINESS_CLIENT_ID",
    clientSecretEnvVar: "META_BUSINESS_CLIENT_SECRET",
  },
};

/** Returns the base URL for OAuth redirect URIs */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Builds the OAuth redirect URI for a given platform */
export function getRedirectUri(platform: Platform): string {
  return `${getBaseUrl()}/api/auth/callback/${platform}`;
}
