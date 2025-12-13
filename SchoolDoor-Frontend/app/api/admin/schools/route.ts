import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const path = `/schools${queryString ? `?${queryString}` : ""}`;

  const response = await backendFetch(path, {
    method: "GET",
    token: session.token,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}


