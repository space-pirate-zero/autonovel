import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const WEBHOOK_URL = process.env.SUBSCRIBE_WEBHOOK_URL;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  // Basic per-IP abuse brake (in-memory, single-replica — see lib/rate-limit.ts).
  if (!rateLimit(`subscribe:${clientIp(request)}`, { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, name, type } = body;

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const payload = {
      email: email.trim(),
      name: (name || "").trim(),
      type: type || "newsletter",
      timestamp: new Date().toISOString(),
      source: "sa9-website",
    };

    if (WEBHOOK_URL) {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Subscribe webhook error:", res.status);
        return NextResponse.json(
          { error: "Failed to save subscription" },
          { status: 500 }
        );
      }
    } else {
      console.log("[SUBSCRIBE]", JSON.stringify(payload));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
