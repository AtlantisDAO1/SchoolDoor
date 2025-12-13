import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MEMBER_TOKEN_COOKIE } from "@/lib/config";

// Redirect old participant API routes to member routes
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(MEMBER_TOKEN_COOKIE);
  return NextResponse.json({ success: true });
}
