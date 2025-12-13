import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import {
  MEMBER_COOKIE_MAX_AGE,
  MEMBER_TOKEN_COOKIE,
} from "@/lib/config";

type LoginPayload = {
  email: string;
  password: string;
};

// Proxy old participant API routes to member routes
export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload;

  try {
    const backendResponse = await backendFetch("/members/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error:
            data?.detail ??
            "Unable to authenticate. Please check your credentials.",
        },
        { status: backendResponse.status },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: MEMBER_TOKEN_COOKIE,
      value: data.access_token,
      httpOnly: true,
      path: "/",
      maxAge: MEMBER_COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
      user: data.member_user,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error("Member login failed", error);
    return NextResponse.json(
      { error: "Something went wrong while logging in." },
      { status: 500 },
    );
  }
}
