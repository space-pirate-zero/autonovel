export enum Platform {
  LinkedIn = "linkedin",
  Reddit = "reddit",
  Bluesky = "bluesky",
  Twitter = "twitter",
  Facebook = "facebook",
  Instagram = "instagram",
  GoogleSearchConsole = "google-search-console",
  MetaAds = "meta-ads",
  MetaBusiness = "meta-business",
}

export interface OAuthConfig {
  /** Human-readable name shown in UI */
  name: string;
  /** Short description for the connect page */
  description: string;
  /** Platform icon identifier (used for SVG selection) */
  icon: string;
  /** OAuth 2.0 authorization endpoint */
  authUrl: string;
  /** OAuth 2.0 token exchange endpoint */
  tokenUrl: string;
  /** Requested OAuth scopes */
  scopes: string[];
  /** Environment variable name for the client ID */
  clientIdEnvVar: string;
  /** Environment variable name for the client secret */
  clientSecretEnvVar: string;
  /**
   * Whether this platform uses a non-standard auth flow.
   * "atproto" = Bluesky app-password flow instead of OAuth.
   */
  customFlow?: "atproto";
}

export interface ConnectionStatus {
  platform: Platform;
  connected: boolean;
  connectedAt?: string;
  /** Masked token suffix for display (e.g. "...a1b2") */
  tokenHint?: string;
}

export interface TokenSet {
  platform: Platform;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // Unix ms
  scope?: string;
  /** AT Protocol DID — only set for Bluesky */
  did?: string;
}

export interface AtprotoSession {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}
