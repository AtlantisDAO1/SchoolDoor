import { cookies } from "next/headers";
import { MEMBER_TOKEN_COOKIE } from "./config";
import { backendFetch } from "./api-client";

export type MemberUser = {
  id: number;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  is_active: boolean;
  created_at: string;
  last_login?: string | null;
  updated_at?: string | null;
};

export type MemberSession =
  | {
      token: string;
      user: MemberUser;
    }
  | null;

export async function getMemberSession(): Promise<MemberSession> {
  const cookieStore = await cookies();
  const token = cookieStore?.get?.(MEMBER_TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const response = await backendFetch("/members/me", {
      token,
      method: "GET",
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as MemberUser;

    return {
      token,
      user,
    };
  } catch {
    return null;
  }
}



