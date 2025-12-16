// Server-side only admin API functions (uses cookies)
import { backendFetch } from "./api-client";
import { getAdminSession } from "./auth";

export interface DashboardStats {
  total_schools: number;
  total_reviews: number;
  average_rating: number;
  active_jobs: number;
}

export interface RecentSchool {
  id: number;
  name: string;
  city: string;
  state: string;
  average_rating: number;
  total_reviews: number;
}

export interface RecentJob {
  id: number;
  region: string;
  status: string;
  created_at: string;
  error_message?: string;
}

async function getAuthToken(): Promise<string | null> {
  const session = await getAdminSession();
  return session?.token || null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const token = await getAuthToken();
  const response = await backendFetch("/admin/dashboard/stats", {
    method: "GET",
    token,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  return response.json();
}

export async function getDashboardSchools(
  limit: number = 5,
): Promise<RecentSchool[]> {
  const token = await getAuthToken();
  const response = await backendFetch(
    `/admin/dashboard/schools?limit=${limit}`,
    {
      method: "GET",
      token,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard schools");
  }

  return response.json();
}

export async function getScrapingJobs(
  limit: number = 5,
): Promise<RecentJob[]> {
  const token = await getAuthToken();
  const response = await backendFetch(`/scraping/jobs?limit=${limit}`, {
    method: "GET",
    token,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch scraping jobs");
  }

  return response.json();
}

export interface School {
  id: number;
  name: string;
  city: string;
  state: string;
  average_rating: number;
  total_reviews: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

export async function getSchoolsForAnalytics(
  limit: number = 100,
): Promise<School[]> {
  const token = await getAuthToken();
  const response = await backendFetch(`/schools?limit=${limit}`, {
    method: "GET",
    token,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch schools");
  }

  return response.json();
}

export async function getReviewsForAnalytics(
  limit: number = 100,
): Promise<Review[]> {
  const token = await getAuthToken();
  const response = await backendFetch(`/reviews?limit=${limit}`, {
    method: "GET",
    token,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return response.json();
}

