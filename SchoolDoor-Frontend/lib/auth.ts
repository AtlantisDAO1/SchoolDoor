import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "./config";
import { backendFetch } from "./api-client";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  last_login?: string | null;
};

export type AdminSession =
  | {
      token: string;
      user: AdminUser;
    }
  | null;

export async function getAdminSession(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const token = cookieStore?.get?.(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const response = await backendFetch("/admin/me", {
      token,
      method: "GET",
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as AdminUser;

    return {
      token,
      user,
    };
  } catch {
    return null;
  }
}
