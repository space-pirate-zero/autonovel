// Signal Corps — Instagram Adapter
// Publishes to Instagram via Facebook Graph API v19.0
// Two-step process: create media container → publish container

import {
  Platform,
  PlatformAdapter,
  PlatformResult,
  PlatformMetrics,
  PostTemplate,
  OAuthTokens,
} from "../types.js";
import { formatForPlatform } from "../templates/formatter.js";
import { fetchWithRetry } from "../lib/retry.js";

const GRAPH_BASE = "https://graph.facebook.com/v19.0";

interface MediaContainerResponse {
  id: string;
}

interface PublishResponse {
  id: string;
}

interface InsightsResponse {
  data: Array<{
    name: string;
    values: Array<{ value: number }>;
  }>;
}

export class InstagramAdapter implements PlatformAdapter {
  readonly platform = Platform.Instagram;

  async publish(template: PostTemplate, tokens: OAuthTokens): Promise<PlatformResult> {
    const broadcastId = template.utmParams?.["utm_campaign"] ?? "unknown";
    const formatted = formatForPlatform(template, Platform.Instagram, broadcastId);

    // Instagram requires the ig-user-id stored in token meta
    const igUserId = tokens.meta?.["ig_user_id"];
    if (!igUserId) {
      return {
        platform: Platform.Instagram,
        success: false,
        error: "Missing ig_user_id in token metadata",
      };
    }

    // Instagram requires at least one image URL for feed posts
    const imageUrl = formatted.mediaUrls?.[0];
    if (!imageUrl) {
      return {
        platform: Platform.Instagram,
        success: false,
        error: "Instagram requires at least one media URL",
      };
    }

    try {
      // Step 1: Create media container
      const containerParams = new URLSearchParams({
        image_url: imageUrl,
        caption: formatted.text,
        access_token: tokens.accessToken,
      });

      const containerRes = await fetchWithRetry(`${GRAPH_BASE}/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: containerParams.toString(),
      });

      if (!containerRes.ok) {
        const errorText = await containerRes.text();
        return {
          platform: Platform.Instagram,
          success: false,
          error: `Instagram container creation error ${containerRes.status}: ${errorText}`,
        };
      }

      const container = (await containerRes.json()) as MediaContainerResponse;

      // Step 2: Poll container status until FINISHED (required before publish)
      let ready = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        const statusRes = await fetch(
          `${GRAPH_BASE}/${container.id}?fields=status_code&access_token=${tokens.accessToken}`
        );
        if (statusRes.ok) {
          const statusData = (await statusRes.json()) as { status_code: string };
          if (statusData.status_code === "FINISHED") {
            ready = true;
            break;
          }
          if (statusData.status_code === "ERROR") {
            return {
              platform: Platform.Instagram,
              success: false,
              error: "Instagram media container processing failed",
            };
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2s between polls
      }

      if (!ready) {
        return {
          platform: Platform.Instagram,
          success: false,
          error: "Instagram media container not ready after 60s",
        };
      }

      // Step 3: Publish the container
      const publishParams = new URLSearchParams({
        creation_id: container.id,
        access_token: tokens.accessToken,
      });

      const publishRes = await fetchWithRetry(`${GRAPH_BASE}/${igUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: publishParams.toString(),
      });

      if (!publishRes.ok) {
        const errorText = await publishRes.text();
        return {
          platform: Platform.Instagram,
          success: false,
          error: `Instagram publish error ${publishRes.status}: ${errorText}`,
        };
      }

      const published = (await publishRes.json()) as PublishResponse;

      // Fetch the shortcode for a valid Instagram URL (Graph API returns numeric ID, not shortcode)
      let postUrl: string | undefined;
      try {
        const mediaRes = await fetch(
          `${GRAPH_BASE}/${published.id}?fields=shortcode,permalink&access_token=${tokens.accessToken}`
        );
        if (mediaRes.ok) {
          const mediaData = (await mediaRes.json()) as { permalink?: string; shortcode?: string };
          postUrl = mediaData.permalink ?? (mediaData.shortcode ? `https://www.instagram.com/p/${mediaData.shortcode}/` : undefined);
        }
      } catch { /* non-critical — proceed without URL */ }

      return {
        platform: Platform.Instagram,
        success: true,
        postId: published.id,
        postUrl,
        publishedAt: new Date(),
      };
    } catch (err) {
      return {
        platform: Platform.Instagram,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async getMetrics(postId: string, tokens: OAuthTokens): Promise<PlatformMetrics> {
    // Valid Instagram Graph API media insights: impressions, reach, saved, engagement
    // Note: "likes" and "comments" are NOT valid insight metrics — use "engagement" instead
    const metrics = ["impressions", "reach", "saved", "engagement"].join(",");
    const url = `${GRAPH_BASE}/${postId}/insights?metric=${metrics}&access_token=${tokens.accessToken}`;

    const response = await fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`Instagram metrics error ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as InsightsResponse;
    const getValue = (name: string): number | undefined =>
      data.data.find((d) => d.name === name)?.values[0]?.value;

    return {
      impressions: getValue("impressions"),
      reach: getValue("reach"),
      likes: getValue("likes"),
      comments: getValue("comments"),
      retrievedAt: new Date(),
    };
  }
}
