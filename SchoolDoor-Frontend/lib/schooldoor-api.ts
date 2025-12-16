import { BACKEND_API_URL, SCHOOLDOR_API_KEY } from "@/lib/config";

// Use BACKEND_API_URL for server-side calls (SSR)
// This points to localhost:6001/api/v1 when running server-side
const API_BASE_URL = BACKEND_API_URL;

const API_KEY = SCHOOLDOR_API_KEY;

export type School = {
  id: number;
  name: string;
  city?: string;
  state?: string;
  board?: string;
  school_type?: string;
  average_rating?: number | null;
};

export type Review = {
  id: number;
  parent_name?: string | null;
  member?: {
    id: number;
    full_name?: string | null;
    email: string;
  } | null;
  content: string;
  overall_rating: number;
  created_at?: string;
  status?: string;
};

export async function fetchSchools(limit = 100) {
  try {
    console.log(buildHeaders(), "apikey here")
    const res = await fetch(`${API_BASE_URL}/schools?limit=${limit}`, {
      headers: buildHeaders(),
      cache: "no-store",
    });

    console.log(res)
    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      console.error(`Failed to fetch schools: ${res.status} ${errorText}`);
      throw new Error(`Failed to load schools (${res.status}): ${errorText}`);
    }

    const data = (await res.json()) as School[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching schools:", error);
    throw error;
  }
}

export async function fetchSchoolReviews(schoolId: number, limit = 5) {
  const res = await fetch(
    `${API_BASE_URL}/schools/${schoolId}/reviews?limit=${limit}`,
    {
      headers: buildHeaders(),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to load reviews for school ${schoolId}`);
  }

  const data = await res.json();
  const reviews = Array.isArray(data)
    ? data
    : Array.isArray(data?.reviews)
      ? data.reviews
      : [];

  return reviews as Review[];
}

export async function submitSchoolReview(payload: {
  school_id: number;
  overall_rating: number;
  content: string;
  parent_name?: string | null;
  is_anonymous?: boolean;
}) {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      ...buildHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(
      message || `Failed to submit review for school ${payload.school_id}`,
    );
  }

  return res.json();
}

function buildHeaders(): Record<string, string> {
  return API_KEY ? { "x-api-key": API_KEY } : {};
}
