import { NextResponse } from "next/server";
import { ALFRED_CHAT_API_KEY, ALFRED_CHAT_API_URL } from "@/lib/config";

const API_URL = ALFRED_CHAT_API_URL;
const API_KEY = ALFRED_CHAT_API_KEY;
const TIMEOUT_MS = 20_000;

export async function POST(request: Request) {
  if (!API_KEY) {
    console.error("Missing ALFRED_CHAT_API_KEY environment variable");
    return NextResponse.json(
      { error: "Chat service is unavailable" },
      { status: 500 },
    );
  }

  let payload: {
    message?: string;
    sessionId?: string;
    personality?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }

  const { message, sessionId, personality } = payload ?? {};

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 },
    );
  }

  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      signal: controller.signal,
      body: JSON.stringify({
        message,
        session_id: sessionId,
        personality: personality ?? "schooldoor-cocreate",
      }),
    });

    clearTimeout(timeout);

    if (!upstreamResponse.ok) {
      const text = await upstreamResponse.text();
      console.error(
        `Alfred upstream error ${upstreamResponse.status}: ${text}`,
      );
      return NextResponse.json(
        { error: "Alfred could not respond right now." },
        { status: 502 },
      );
    }

    const data = await upstreamResponse.json();

    return NextResponse.json({
      ok: true,
      reply: data.reply ?? "",
      upstream: data,
    });
  } catch (error) {
    console.error("Alfred chat request failed", error);
    const isAbortError =
      error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        error: isAbortError
          ? "Alfred is taking too long to respond. Please try again."
          : "We could not reach Alfred at the moment.",
      },
      { status: 504 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
