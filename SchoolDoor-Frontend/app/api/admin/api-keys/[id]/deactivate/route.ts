import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const response = await backendFetch(`/api-keys/${id}/deactivate`, {
    method: "POST",
    token: session.token,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

