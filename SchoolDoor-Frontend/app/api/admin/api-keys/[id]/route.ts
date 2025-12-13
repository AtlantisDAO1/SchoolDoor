import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const response = await backendFetch(`/api-keys/${id}`, {
    method: "PUT",
    token: session.token,
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const response = await backendFetch(`/api-keys/${id}`, {
    method: "DELETE",
    token: session.token,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to delete" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

