"use client";

import { useState, useEffect } from "react";

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
      user: MemberUser;
    }
  | null;

export function useMemberSession() {
  const [session, setSession] = useState<MemberSession>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/member/me");
        if (response.ok) {
          const user = (await response.json()) as MemberUser;
          setSession({ user });
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const refreshSession = async () => {
    try {
      const response = await fetch("/api/member/me");
      if (response.ok) {
        const user = (await response.json()) as MemberUser;
        setSession({ user });
        return true;
      } else {
        setSession(null);
        return false;
      }
    } catch {
      setSession(null);
      return false;
    }
  };

  return { session, loading, refreshSession };
}



