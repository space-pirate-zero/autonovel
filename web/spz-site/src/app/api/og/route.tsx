/**
 * Dynamic OG image generation for Space Pirate Zero.
 * Generates branded social sharing images with consistent NEON design system.
 *
 * Query params:
 * - title: Main heading text (required)
 * - subtitle: Secondary text (optional)
 * - type: Content type badge (article, book, press, patent, brand, music, bio)
 */

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const title = searchParams.get("title") ?? "Space Pirate Zero";
  const subtitle = searchParams.get("subtitle") ?? "";
  const type = searchParams.get("type") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, rgba(255,45,120,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,240,255,0.06) 0%, transparent 50%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo & branding */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #ff2d78, #00f0ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            SPZ
          </div>
          <span style={{ color: "#888", fontSize: 18, fontWeight: 600 }}>
            Space Pirate Zero
          </span>
        </div>

        {/* Type badge */}
        {type && (
          <div
            style={{
              position: "absolute",
              top: 48,
              right: 60,
              padding: "6px 16px",
              background: "rgba(255,45,120,0.2)",
              color: "#ff2d78",
              fontSize: 14,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              border: "1px solid rgba(255,45,120,0.3)",
            }}
          >
            {type}
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: title.length > 50 ? 44 : title.length > 30 ? 56 : 64,
            fontWeight: 900,
            color: "white",
            lineHeight: 1.1,
            margin: 0,
            maxWidth: "90%",
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: 24,
              color: "#888",
              margin: 0,
              paddingTop: 16,
              maxWidth: "85%",
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(90deg, #ff2d78, #bf5fff, #00f0ff, transparent)",
          }}
        />

        {/* Spaceship Alpha 9 attribution */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 60,
            color: "#555",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          spacepiratezero.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
