import { BACKEND_API_URL } from "./config";

type FetchOptions = RequestInit & { token?: string | null };

export async function backendFetch(
  path: string,
  { token, headers, ...init }: FetchOptions = {},
) {
  const url = `${BACKEND_API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  return response;
}
