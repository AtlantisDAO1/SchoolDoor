import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/config";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_TOKEN_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
