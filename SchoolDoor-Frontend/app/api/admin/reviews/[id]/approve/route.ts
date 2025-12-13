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

  // Try the approve endpoint, if not available, update the review status
  try {
    const response = await backendFetch(`/admin/reviews/${id}/approve`, {
      method: "PUT",
      token: session.token,
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
  } catch (e) {
    // Fallback: update review status directly
  }

  // Fallback: update review with approved status
  const response = await backendFetch(`/reviews/${id}`, {
    method: "PUT",
    token: session.token,
    body: JSON.stringify({ status: "approved" }),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

