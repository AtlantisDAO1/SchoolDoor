import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MEMBER_TOKEN_COOKIE } from "@/lib/config";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(MEMBER_TOKEN_COOKIE);

  return NextResponse.json({ success: true });
}



