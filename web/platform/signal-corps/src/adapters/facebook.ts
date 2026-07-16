// Signal Corps — Facebook Adapter
// Publishes to Facebook pages via Graph API v19.0

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

interface GraphPostResponse {
  id: string;
}

interface GraphInsightsResponse {
  data: Array<{
    name: string;
    values: Array<{ value: number }>;
  }>;
}

export class FacebookAdapter implements PlatformAdapter {
  readonly platform = Platform.Facebook;

  async publish(template: PostTemplate, tokens: OAuthTokens): Promise<PlatformResult> {
    const broadcastId = template.utmParams?.["utm_campaign"] ?? "unknown";
    const formatted = formatForPlatform(template, Platform.Facebook, broadcastId);

    const meta = formatted.platformMeta as Record<string, string> | undefined;

    try {
      const params = new URLSearchParams({
        message: formatted.text,
        access_token: tokens.accessToken,
      });

      if (meta?.["link"]) {
        params.set("link", meta["link"]);
      }

      const response = await fetchWithRetry(`${GRAPH_BASE}/me/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          platform: Platform.Facebook,
          success: false,
          error: `Facebook API error ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as GraphPostResponse;
      const [pageId, postId] = data.id.split("_");

      return {
        platform: Platform.Facebook,
        success: true,
        postId: data.id,
        postUrl: `https://www.facebook.com/${pageId ?? ""}/posts/${postId ?? data.id}`,
        publishedAt: new Date(),
      };
    } catch (err) {
      return {
        platform: Platform.Facebook,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async getMetrics(postId: string, tokens: OAuthTokens): Promise<PlatformMetrics> {
    const metrics = [
      "post_impressions",
      "post_reactions_by_type_total",
      "post_clicks",
    ].join(",");

    const url = `${GRAPH_BASE}/${postId}/insights?metric=${metrics}&access_token=${tokens.accessToken}`;
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Facebook metrics error ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as GraphInsightsResponse;

    const getValue = (name: string): number | undefined => {
      const item = data.data.find((d) => d.name === name);
      return item?.values[0]?.value;
    };

    return {
      impressions: getValue("post_impressions"),
      clicks: getValue("post_clicks"),
      retrievedAt: new Date(),
    };
  }
}
