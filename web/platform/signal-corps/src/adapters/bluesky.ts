// Signal Corps — Bluesky Adapter
// Publishes via the AT Protocol (atproto) XRPC API

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

const BSKY_PDS = "https://bsky.social";
const CREATE_RECORD_URL = `${BSKY_PDS}/xrpc/com.atproto.repo.createRecord`;

interface AtProtoRecord {
  $type: "app.bsky.feed.post";
  text: string;
  createdAt: string;
  embed?: {
    $type: "app.bsky.embed.images";
    images: Array<{ image: AtProtoBlobRef; alt: string }>;
  };
  langs?: string[];
}

interface AtProtoBlobRef {
  $type: "blob";
  ref: { $link: string };
  mimeType: string;
  size: number;
}

interface CreateRecordResponse {
  uri: string;
  cid: string;
}

interface UploadBlobResponse {
  blob: AtProtoBlobRef;
}

export class BlueskyAdapter implements PlatformAdapter {
  readonly platform = Platform.Bluesky;

  async publish(template: PostTemplate, tokens: OAuthTokens): Promise<PlatformResult> {
    const broadcastId = template.utmParams?.["utm_campaign"] ?? "unknown";
    const formatted = formatForPlatform(template, Platform.Bluesky, broadcastId);

    // DID/handle is stored in token meta
    const did = tokens.meta?.["did"];
    if (!did) {
      return {
        platform: Platform.Bluesky,
        success: false,
        error: "Missing DID in token metadata (required for atproto repo identification)",
      };
    }

    try {
      const record: AtProtoRecord = {
        $type: "app.bsky.feed.post",
        text: formatted.text,
        createdAt: new Date().toISOString(),
        langs: ["en"],
      };

      // Attach images if provided (must upload as blobs first)
      if (formatted.mediaUrls && formatted.mediaUrls.length > 0) {
        const imageBlobs = await Promise.all(
          formatted.mediaUrls.slice(0, 4).map((url) => this._uploadBlob(url, tokens.accessToken))
        );
        record.embed = {
          $type: "app.bsky.embed.images",
          images: imageBlobs.map((blob) => ({ image: blob, alt: "" })),
        };
      }

      const response = await fetchWithRetry(CREATE_RECORD_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo: did,
          collection: "app.bsky.feed.post",
          record,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          platform: Platform.Bluesky,
          success: false,
          error: `Bluesky API error ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as CreateRecordResponse;
      // uri format: at://did:plc:.../app.bsky.feed.post/rkey
      const rkey = data.uri.split("/").pop() ?? data.uri;
      const handle = tokens.meta?.["handle"] ?? did;

      return {
        platform: Platform.Bluesky,
        success: true,
        postId: data.uri,
        postUrl: `https://bsky.app/profile/${handle}/post/${rkey}`,
        publishedAt: new Date(),
      };
    } catch (err) {
      return {
        platform: Platform.Bluesky,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async getMetrics(_postId: string, _tokens: OAuthTokens): Promise<PlatformMetrics> {
    // Bluesky does not yet expose a public metrics API (as of 2026)
    // Return a stub — future implementation can use app.bsky.feed.getPostThread
    return {
      impressions: undefined,
      likes: undefined,
      reposts: undefined,
      comments: undefined,
      retrievedAt: new Date(),
    };
  }

  private async _uploadBlob(imageUrl: string, accessToken: string): Promise<AtProtoBlobRef> {
    // Download the image
    const imgResponse = await fetchWithRetry(imageUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to fetch image for Bluesky blob upload: ${imageUrl}`);
    }
    const contentType = imgResponse.headers.get("content-type") ?? "image/jpeg";
    const buffer = await imgResponse.arrayBuffer();

    // Upload to PDS
    const uploadResponse = await fetchWithRetry(`${BSKY_PDS}/xrpc/com.atproto.repo.uploadBlob`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": contentType,
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Bluesky blob upload failed: ${uploadResponse.status}`);
    }

    const data = (await uploadResponse.json()) as UploadBlobResponse;
    return data.blob;
  }
}
