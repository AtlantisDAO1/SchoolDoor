import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const response = await backendFetch(`/admin/users/${id}`, {
    method: "PUT",
    token: session.token,
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

