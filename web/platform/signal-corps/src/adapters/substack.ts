// Signal Corps — Substack Adapter
// Publishes newsletters via the Substack Publications API.
//
// Substack does not expose a fully public REST publish API. Authenticated
// users (or automations with a session cookie) can create drafts via
// `POST https://{publication}.substack.com/api/v1/drafts` and publish them
// via `POST https://{publication}.substack.com/api/v1/drafts/:id/publish`.
// Tokens stored in OAuthTokens.meta:
//   - publicationHost  (e.g. "spacepiratezero.substack.com")
//   - publicationId    (numeric id from Substack dashboard)
// The access token must be a Substack session token (cookie value of
// `substack.sid`). We pass it as a Bearer token for consistency with other
// adapters; the API accepts both cookie and Bearer auth.

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
import { logger } from "../lib/logger.js";

interface DraftCreateResponse {
  id: number;
  post_id?: number;
  draft_title?: string;
  draft_body?: string;
}

interface DraftPublishResponse {
  id: number;
  slug?: string;
  post_url?: string;
  title?: string;
}

interface PostStatsResponse {
  views?: number;
  opens?: number;
  reactions?: number;
  comments?: number;
  clicks?: number;
}

export class SubstackAdapter implements PlatformAdapter {
  readonly platform = Platform.Substack;

  async publish(template: PostTemplate, tokens: OAuthTokens): Promise<PlatformResult> {
    const broadcastId = template.utmParams?.["utm_campaign"] ?? "unknown";
    const formatted = formatForPlatform(template, Platform.Substack, broadcastId);

    const publicationHost = tokens.meta?.["publicationHost"];
    if (!publicationHost) {
      return {
        platform: Platform.Substack,
        success: false,
        error: "Missing publicationHost in token metadata",
      };
    }

    const apiBase = `https://${publicationHost}/api/v1`;

    try {
      // Step 1: create a draft
      const draftPayload = {
        draft_title: template.linkUrl ? `${formatted.text.slice(0, 80)}…` : formatted.text.slice(0, 120),
        draft_subtitle: "",
        draft_body: buildDraftBody(formatted.text, template.linkUrl),
        audience: "everyone",
        type: "newsletter",
      };

      const draftResponse = await fetchWithRetry(`${apiBase}/drafts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
          "User-Agent": "SA9-SignalCorps/1.0",
        },
        body: JSON.stringify(draftPayload),
      });

      if (!draftResponse.ok) {
        const errorText = await draftResponse.text();
        return {
          platform: Platform.Substack,
          success: false,
          error: sanitizeErrorText(
            `Substack draft create error ${draftResponse.status}: ${errorText}`
          ),
        };
      }

      const draft = (await draftResponse.json()) as DraftCreateResponse;

      // Step 2: publish the draft
      const publishResponse = await fetchWithRetry(
        `${apiBase}/drafts/${draft.id}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            "Content-Type": "application/json",
            "User-Agent": "SA9-SignalCorps/1.0",
          },
          body: JSON.stringify({ send: true }),
        }
      );

      if (!publishResponse.ok) {
        const errorText = await publishResponse.text();
        return {
          platform: Platform.Substack,
          success: false,
          error: sanitizeErrorText(
            `Substack publish error ${publishResponse.status}: ${errorText}`
          ),
          postId: String(draft.id),
        };
      }

      const published = (await publishResponse.json()) as DraftPublishResponse;
      const postId = String(published.id ?? draft.id);
      const postUrl =
        published.post_url ??
        (published.slug ? `https://${publicationHost}/p/${published.slug}` : `https://${publicationHost}`);

      logger.info(
        { platform: "substack", postId, broadcastId },
        "Substack broadcast published"
      );

      return {
        platform: Platform.Substack,
        success: true,
        postId,
        postUrl,
        publishedAt: new Date(),
      };
    } catch (err) {
      return {
        platform: Platform.Substack,
        success: false,
        error: err instanceof Error ? sanitizeErrorText(err.message) : String(err),
      };
    }
  }

  async getMetrics(postId: string, tokens: OAuthTokens): Promise<PlatformMetrics> {
    const publicationHost = tokens.meta?.["publicationHost"];
    if (!publicationHost) {
      return {
        impressions: undefined,
        retrievedAt: new Date(),
      };
    }

    try {
      const response = await fetchWithRetry(
        `https://${publicationHost}/api/v1/posts/${postId}/stats`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            "User-Agent": "SA9-SignalCorps/1.0",
          },
        }
      );

      if (!response.ok) {
        logger.warn(
          { postId, status: response.status },
          "Substack metrics fetch failed"
        );
        return { retrievedAt: new Date() };
      }

      const stats = (await response.json()) as PostStatsResponse;
      return {
        impressions: stats.views,
        likes: stats.reactions,
        comments: stats.comments,
        clicks: stats.clicks,
        reach: stats.opens,
        retrievedAt: new Date(),
      };
    } catch (err) {
      logger.warn(
        { postId, err: err instanceof Error ? err.message : String(err) },
        "Substack metrics error"
      );
      return { retrievedAt: new Date() };
    }
  }
}

/** Convert plain text content into minimal Substack-flavored HTML */
function buildDraftBody(text: string, linkUrl?: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join("");
  const linkBlock = linkUrl
    ? `<p><a href="${escapeHtml(linkUrl)}">${escapeHtml(linkUrl)}</a></p>`
    : "";
  return `${paragraphs}${linkBlock}`;
}

function escapeHtml(raw: string): string {
  return raw
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Strip anything that looks like a session cookie from error payloads */
function sanitizeErrorText(text: string): string {
  return text
    .replaceAll(/substack\.sid=[^;\s"]+/gi, "substack.sid=[redacted]")
    .replaceAll(/set-cookie:\s*[^\n]+/gi, "set-cookie: [redacted]");
}
