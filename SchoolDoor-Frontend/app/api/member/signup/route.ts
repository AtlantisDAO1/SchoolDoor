import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import {
  MEMBER_COOKIE_MAX_AGE,
  MEMBER_TOKEN_COOKIE,
} from "@/lib/config";

type SignupPayload = {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  location?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SignupPayload;

  try {
    const backendResponse = await backendFetch("/members/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await backendResponse.json();
    } catch (jsonError) {
      // If response is not JSON, read as text
      const textResponse = await backendResponse.text();
      console.error("Backend response (not JSON):", textResponse);
      return NextResponse.json(
        {
          error: "Server error. Please check if the database migration has been run.",
        },
        { status: 500 },
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error:
            data?.detail ??
            "Unable to create account. Please check your information.",
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
    console.error("Member signup failed", error);
    return NextResponse.json(
      { error: "Something went wrong while creating your account." },
      { status: 500 },
    );
  }
}



