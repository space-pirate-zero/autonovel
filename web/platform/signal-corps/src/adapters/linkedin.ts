// Signal Corps — LinkedIn Adapter
// Publishes to LinkedIn using the UGC Posts API (v2)

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

const UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";
const PROFILE_URL = "https://api.linkedin.com/v2/me";

interface LinkedInMeResponse {
  id: string;
}

interface LinkedInUgcPost {
  author: string;
  lifecycleState: "PUBLISHED";
  specificContent: {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: { text: string };
      shareMediaCategory: "NONE" | "ARTICLE" | "IMAGE";
      media?: Array<{
        status: "READY";
        originalUrl?: string;
        title?: { text: string };
      }>;
    };
  };
  visibility: {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" | "CONNECTIONS";
  };
}

export class LinkedInAdapter implements PlatformAdapter {
  readonly platform = Platform.LinkedIn;

  async publish(template: PostTemplate, tokens: OAuthTokens): Promise<PlatformResult> {
    const broadcastId = template.utmParams?.["utm_campaign"] ?? "unknown";
    const formatted = formatForPlatform(template, Platform.LinkedIn, broadcastId);

    try {
      // Resolve the author URN (person ID)
      const authorUrn = await this._resolveAuthorUrn(tokens.accessToken);

      const hasLink =
        (formatted.platformMeta as Record<string, string> | undefined)?.["link"] !== undefined;
      const linkUrl =
        (formatted.platformMeta as Record<string, string> | undefined)?.["link"];

      const ugcPost: LinkedInUgcPost = {
        author: `urn:li:person:${authorUrn}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: formatted.text },
            shareMediaCategory: hasLink ? "ARTICLE" : "NONE",
            ...(hasLink && linkUrl
              ? {
                  media: [
                    {
                      status: "READY",
                      originalUrl: linkUrl,
                    },
                  ],
                }
              : {}),
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const response = await fetchWithRetry(UGC_POSTS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(ugcPost),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          platform: Platform.LinkedIn,
          success: false,
          error: `LinkedIn API error ${response.status}: ${errorText}`,
        };
      }

      // LinkedIn returns the post URN in the X-RestLi-Id header
      const postId = response.headers.get("x-restli-id") ?? response.headers.get("X-RestLi-Id") ?? "";

      return {
        platform: Platform.LinkedIn,
        success: true,
        postId,
        postUrl: postId ? `https://www.linkedin.com/feed/update/${postId}` : undefined,
        publishedAt: new Date(),
      };
    } catch (err) {
      return {
        platform: Platform.LinkedIn,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async getMetrics(postId: string, tokens: OAuthTokens): Promise<PlatformMetrics> {
    // LinkedIn Share Statistics API — use shares query for individual post metrics
    const encodedId = encodeURIComponent(postId);
    const url = `https://api.linkedin.com/v2/socialActions/${encodedId}`;

    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn metrics error ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as {
      elements: Array<{
        totalShareStatistics: {
          impressionCount: number;
          likeCount: number;
          shareCount: number;
          commentCount: number;
          clickCount: number;
          uniqueImpressionsCount: number;
        };
      }>;
    };

    const stats = data.elements[0]?.totalShareStatistics;
    return {
      impressions: stats?.impressionCount,
      likes: stats?.likeCount,
      reposts: stats?.shareCount,
      comments: stats?.commentCount,
      clicks: stats?.clickCount,
      reach: stats?.uniqueImpressionsCount,
      retrievedAt: new Date(),
    };
  }

  private async _resolveAuthorUrn(accessToken: string): Promise<string> {
    const response = await fetchWithRetry(PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`LinkedIn profile fetch failed: ${response.status}`);
    }
    const data = (await response.json()) as LinkedInMeResponse;
    return data.id;
  }
}
