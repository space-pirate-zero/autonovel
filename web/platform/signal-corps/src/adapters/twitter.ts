// Signal Corps — Twitter Adapter
// Publishes to Twitter/X using the v2 API with Bearer token (OAuth 2.0)

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

const TWEETS_URL = "https://api.twitter.com/2/tweets";

interface TweetResponse {
  data: {
    id: string;
    text: string;
  };
}

interface TweetMetricsResponse {
  data: {
    public_metrics: {
      impression_count: number;
      like_count: number;
      retweet_count: number;
      reply_count: number;
      url_link_clicks?: number;
    };
  };
}

export class TwitterAdapter implements PlatformAdapter {
  readonly platform = Platform.Twitter;

  async publish(template: PostTemplate, tokens: OAuthTokens): Promise<PlatformResult> {
    const formatted = formatForPlatform(template, Platform.Twitter, this._getBroadcastId(template));

    const body: Record<string, unknown> = { text: formatted.text };

    if (formatted.mediaUrls && formatted.mediaUrls.length > 0) {
      // Media must be uploaded separately via v1.1 /media/upload; store IDs in meta
      // For now we include the first URL in the text if not already present
    }

    try {
      const response = await fetchWithRetry(TWEETS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
          "User-Agent": "SA9-SignalCorps/1.0",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          platform: Platform.Twitter,
          success: false,
          error: `Twitter API error ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as TweetResponse;
      const postId = data.data.id;

      return {
        platform: Platform.Twitter,
        success: true,
        postId,
        postUrl: `https://twitter.com/i/web/status/${postId}`,
        publishedAt: new Date(),
      };
    } catch (err) {
      return {
        platform: Platform.Twitter,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async getMetrics(postId: string, tokens: OAuthTokens): Promise<PlatformMetrics> {
    const url = `${TWEETS_URL}/${postId}?tweet.fields=public_metrics`;
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "User-Agent": "SA9-SignalCorps/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter metrics error ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as TweetMetricsResponse;
    const m = data.data.public_metrics;

    return {
      impressions: m.impression_count,
      likes: m.like_count,
      reposts: m.retweet_count,
      comments: m.reply_count,
      clicks: m.url_link_clicks,
      retrievedAt: new Date(),
    };
  }

  /** Extract broadcast ID from template UTM params if present */
  private _getBroadcastId(template: PostTemplate): string {
    return template.utmParams?.["utm_campaign"] ?? "unknown";
  }
}
