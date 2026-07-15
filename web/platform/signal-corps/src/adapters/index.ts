// Signal Corps — Adapter Registry
// Maps each Platform enum value to a singleton adapter instance

import { Platform, PlatformAdapter } from "../types.js";
import { TwitterAdapter } from "./twitter.js";
import { LinkedInAdapter } from "./linkedin.js";
import { FacebookAdapter } from "./facebook.js";
import { InstagramAdapter } from "./instagram.js";
import { BlueskyAdapter } from "./bluesky.js";
import { RedditAdapter } from "./reddit.js";
import { SubstackAdapter } from "./substack.js";

const registry = new Map<Platform, PlatformAdapter>([
  [Platform.Twitter, new TwitterAdapter()],
  [Platform.LinkedIn, new LinkedInAdapter()],
  [Platform.Facebook, new FacebookAdapter()],
  [Platform.Instagram, new InstagramAdapter()],
  [Platform.Bluesky, new BlueskyAdapter()],
  [Platform.Reddit, new RedditAdapter()],
  [Platform.Substack, new SubstackAdapter()],
]);

/**
 * Retrieve the adapter for a given platform.
 * Throws if the platform is not registered (indicates a programming error).
 */
export function getAdapter(platform: Platform): PlatformAdapter {
  const adapter = registry.get(platform);
  if (!adapter) {
    throw new Error(`No adapter registered for platform: ${platform}`);
  }
  return adapter;
}

/**
 * List all registered platform adapters.
 */
export function getAllAdapters(): PlatformAdapter[] {
  return Array.from(registry.values());
}

export {
  TwitterAdapter,
  LinkedInAdapter,
  FacebookAdapter,
  InstagramAdapter,
  BlueskyAdapter,
  RedditAdapter,
  SubstackAdapter,
};
