import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, optIn, targetRecipient } = body;

    if (!name || !email || !mobile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log contact submission (replace with email service or DB write in production)
    console.log("[Contact Form]", {
      name,
      email,
      mobile,
      optIn,
      targetRecipient,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ status: "ok", message: "Contact received" });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
