import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_TOKEN_COOKIE,
} from "@/lib/config";

type LoginPayload = {
  username: string;
  password: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload;

  try {
    const backendResponse = await backendFetch("/admin/login", {
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
      name: ADMIN_TOKEN_COOKIE,
      value: data.access_token,
      httpOnly: true,
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
      user: data.admin_user,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json(
      { error: "Something went wrong while logging in." },
      { status: 500 },
    );
  }
}
