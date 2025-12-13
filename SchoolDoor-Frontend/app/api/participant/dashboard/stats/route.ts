import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { getMemberSession } from "@/lib/member-auth";

// Redirect old participant API routes to member routes
export async function GET() {
  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await backendFetch("/members/dashboard/stats", {
    method: "GET",
    token: session.token,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
