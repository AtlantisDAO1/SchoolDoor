import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { getMemberSession } from "@/lib/member-auth";

// Redirect old participant API routes to member routes
export async function GET(request: NextRequest) {
  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status_filter = searchParams.get("status_filter");
  const limit = searchParams.get("limit") || "20";
  const offset = searchParams.get("offset") || "0";

  const params = new URLSearchParams({
    limit,
    offset,
  });
  if (status_filter) {
    params.append("status_filter", status_filter);
  }

  const response = await backendFetch(
    `/members/my-reviews?${params.toString()}`,
    {
      method: "GET",
      token: session.token,
    }
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
