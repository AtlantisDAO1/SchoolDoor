import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { ADMIN_TOKEN_COOKIE } from "@/lib/config";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await backendFetch("/admin/me", {
    token,
    method: "GET",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await response.json();
  return NextResponse.json(user);
}
