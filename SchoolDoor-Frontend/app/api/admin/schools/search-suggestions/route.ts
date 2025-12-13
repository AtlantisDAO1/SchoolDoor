import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "";
  const limit = searchParams.get("limit") || "5";

  const response = await backendFetch(
    `/schools/search-suggestions?query=${encodeURIComponent(query)}&limit=${limit}`,
    {
      method: "GET",
      token: session.token,
    },
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}


