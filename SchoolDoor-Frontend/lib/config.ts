export const BACKEND_API_URL =
  process.env.BACKEND_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:6001/api/v1";

export const SCHOOLDOR_API_KEY = process.env.SCHOOLDOR_API_KEY;

export const ALFRED_CHAT_API_KEY = process.env.ALFRED_CHAT_API_KEY;
export const ALFRED_CHAT_API_URL =
  process.env.ALFRED_CHAT_API_URL || "https://api.dropchain.ai/gemini/chat";

export const ADMIN_TOKEN_COOKIE = "schooldoor_admin_token";

export const ADMIN_COOKIE_MAX_AGE = 60 * 30; // 30 minutes to match backend token

export const MEMBER_TOKEN_COOKIE = "schooldoor_member_token";

export const MEMBER_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours to match backend token
