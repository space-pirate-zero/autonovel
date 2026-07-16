// Signal Corps — Reddit Adapter
// Publishes text posts via the Reddit OAuth API

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

const REDDIT_API_BASE = "https://oauth.reddit.com";
const SUBMIT_URL = `${REDDIT_API_BASE}/api/submit`;

interface RedditSubmitResponse {
  json: {
    errors: Array<[string, string, string]>;
    data?: {
      url: string;
      name: string; // e.g. "t3_abc123"
      id: string;
    };
  };
}

interface RedditPostInfo {
  data: {
    ups: number;
    downs: number;
    num_comments: number;
    score: number;
    upvote_ratio: number;
  };
}

export class RedditAdapter implements PlatformAdapter {
  readonly platform = Platform.Reddit;

  async publish(template: PostTemplate, tokens: OAuthTokens): Promise<PlatformResult> {
    const broadcastId = template.utmParams?.["utm_campaign"] ?? "unknown";
    const formatted = formatForPlatform(template, Platform.Reddit, broadcastId);

    // Subreddit must be stored in token meta (e.g. "r/technology" → "technology")
    const subreddit = tokens.meta?.["subreddit"];
    if (!subreddit) {
      return {
        platform: Platform.Reddit,
        success: false,
        error: "Missing subreddit in token metadata",
      };
    }

    try {
      const params = new URLSearchParams({
        api_type: "json",
        kind: "self",
        sr: subreddit,
        title: this._deriveTitle(formatted.text),
        text: formatted.text,
        resubmit: "true",
        nsfw: "false",
        spoiler: "false",
        sendreplies: "true",
      });

      const response = await fetchWithRetry(SUBMIT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "SA9-SignalCorps/1.0 (by /u/sa9bot)",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          platform: Platform.Reddit,
          success: false,
          error: `Reddit API error ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as RedditSubmitResponse;

      if (data.json.errors.length > 0) {
        const [errType, errMsg] = data.json.errors[0] ?? ["UNKNOWN", "Unknown error"];
        return {
          platform: Platform.Reddit,
          success: false,
          error: `Reddit submission error: ${errType} — ${errMsg}`,
        };
      }

      const postData = data.json.data;
      if (!postData) {
        return {
          platform: Platform.Reddit,
          success: false,
          error: "Reddit returned no post data",
        };
      }

      return {
        platform: Platform.Reddit,
        success: true,
        postId: postData.id,
        postUrl: postData.url,
        publishedAt: new Date(),
      };
    } catch (err) {
      return {
        platform: Platform.Reddit,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async getMetrics(postId: string, tokens: OAuthTokens): Promise<PlatformMetrics> {
    const url = `${REDDIT_API_BASE}/by_id/t3_${postId}.json`;
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "User-Agent": "SA9-SignalCorps/1.0 (by /u/sa9bot)",
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit metrics error ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as { data: { children: Array<{ data: RedditPostInfo["data"] }> } };
    const post = data.data.children[0]?.data;

    return {
      likes: post?.ups,
      comments: post?.num_comments,
      retrievedAt: new Date(),
    };
  }

  /** Reddit post titles are limited to 300 chars; derive from the first line of content */
  private _deriveTitle(text: string): string {
    const firstLine = text.split("\n")[0] ?? text;
    return firstLine.length > 300 ? firstLine.slice(0, 297) + "..." : firstLine;
  }
}
