import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const response = await backendFetch(`/admin/school-requests/${id}/approve`, {
    method: "PUT",
    token: session.token,
    body: JSON.stringify({ admin_notes: body.admin_notes }),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}



