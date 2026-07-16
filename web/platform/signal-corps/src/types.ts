// Signal Corps — Core Types
// Broadcast management system for SA9 multi-platform social publishing

export enum Platform {
  Twitter = "twitter",
  LinkedIn = "linkedin",
  Facebook = "facebook",
  Instagram = "instagram",
  Bluesky = "bluesky",
  Reddit = "reddit",
  Substack = "substack",
}

export type BroadcastStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "partially_failed";

export interface PlatformResult {
  platform: Platform;
  success: boolean;
  /**
   * Optional fields below use `| undefined` so `exactOptionalPropertyTypes`
   * lets adapters construct a literal with `postId: undefined` alongside
   * omitting it. Adapters build these values dynamically from API responses
   * that may or may not include every field.
   */
  postId?: string | undefined;
  postUrl?: string | undefined;
  error?: string | undefined;
  publishedAt?: Date | undefined;
}

export interface Broadcast {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  scheduledAt?: Date | undefined;
  publishedAt?: Date | undefined;
  status: BroadcastStatus;
  results: PlatformResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostTemplate {
  content: string;
  /** All optional fields use `| undefined` so callers can spread `FormattedPost` shapes (which carry explicit `mediaUrls: undefined`) into a `PostTemplate` without exactOptional violations. */
  mediaUrls?: string[] | undefined;
  hashtags?: string[] | undefined;
  linkUrl?: string | undefined;
  utmParams?: Record<string, string> | undefined;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string | undefined;
  tokenSecret?: string | undefined; // OAuth 1.0a (Twitter legacy)
  expiresAt?: Date | undefined;
  scope?: string | undefined;
  /** Platform-specific extras (e.g. ig_user_id, reddit_username) */
  meta?: Record<string, string> | undefined;
}

export interface PlatformMetrics {
  /** All counts are `| undefined` for `exactOptionalPropertyTypes` compatibility with adapter return shapes. */
  impressions?: number | undefined;
  likes?: number | undefined;
  reposts?: number | undefined;
  comments?: number | undefined;
  clicks?: number | undefined;
  reach?: number | undefined;
  retrievedAt: Date;
}

export interface PlatformAdapter {
  readonly platform: Platform;
  publish(template: PostTemplate, tokens: OAuthTokens): Promise<PlatformResult>;
  getMetrics(postId: string, tokens: OAuthTokens): Promise<PlatformMetrics>;
}

// Character limits per platform
export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  [Platform.Twitter]: 280,
  [Platform.LinkedIn]: 3000,
  [Platform.Facebook]: 63206,
  [Platform.Instagram]: 2200,
  [Platform.Bluesky]: 300,
  [Platform.Reddit]: 40000,
  [Platform.Substack]: 100000,
};
