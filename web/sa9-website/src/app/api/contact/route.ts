import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

// Pragmatic email shape check — not RFC-perfect, but rejects the obvious
// garbage (missing @, missing domain, whitespace) without over-rejecting.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  // Basic per-IP abuse brake (in-memory, single-replica — see lib/rate-limit.ts).
  if (!rateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, type, message } = body as {
    name?: unknown;
    email?: unknown;
    type?: unknown;
    message?: unknown;
  };

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required" },
      { status: 400 }
    );
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 }
    );
  }

  // Send to Google Sheets via Apps Script Web App
  if (WEBHOOK_URL) {
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          type: type || "general",
          message,
          timestamp: new Date().toISOString(),
          source: "sa9-website",
        }),
      });
    } catch (err) {
      console.error("Google Sheets webhook failed:", err);
    }
  } else {
    // Log to stdout when no webhook configured (visible in docker logs)
    console.log("[CONTACT]", JSON.stringify({ name, email, type, message, timestamp: new Date().toISOString() }));
  }

  return NextResponse.json({ ok: true });
}
