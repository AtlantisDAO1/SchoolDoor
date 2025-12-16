/**
 * Client-side API functions for member users (parents/students).
 * Provides authentication, profile management, and review functionality.
 */


export interface MemberUser {
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
}

export interface MemberUserUpdate {
  full_name?: string;
  phone?: string;
  bio?: string;
  location?: string;
  password?: string;
}

export interface MemberDashboardStats {
  total_reviews: number;
  approved_reviews: number;
  pending_reviews: number;
  rejected_reviews: number;
  average_rating: number | null;
}

export interface MemberReview {
  id: number;
  school_id: number;
  school_name: string;
  school_city?: string | null;
  school_state?: string | null;
  overall_rating: number;
  title?: string | null;
  content: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface ReviewCreate {
  school_id: number;
  overall_rating: number;
  title?: string;
  content: string;
  is_anonymous?: boolean;
}

// Auth functions
export async function memberLogin(
  email: string,
  password: string
): Promise<{ user: MemberUser; expires_in: number }> {
  const response = await fetch("/api/member/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Unable to sign in. Please check your credentials."
    );
  }

  return response.json();
}

export async function memberSignup(
  email: string,
  password: string,
  full_name?: string,
  phone?: string,
  bio?: string,
  location?: string
): Promise<{ user: MemberUser; expires_in: number }> {
  const response = await fetch("/api/member/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
      full_name,
      phone,
      bio,
      location,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Unable to create account. Please try again."
    );
  }

  return response.json();
}

export async function memberLogout(): Promise<void> {
  await fetch("/api/member/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function getMemberProfile(): Promise<MemberUser> {
  const response = await fetch("/api/member/me", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return response.json();
}

export async function updateMemberProfile(
  data: MemberUserUpdate
): Promise<MemberUser> {
  const response = await fetch("/api/member/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data?.error === "string" ? data.error : "Failed to update profile"
    );
  }

  return response.json();
}

// Dashboard functions
export async function getMemberDashboardStats(): Promise<MemberDashboardStats> {
  const response = await fetch("/api/member/dashboard/stats", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  return response.json();
}

// Review functions
export async function getMyReviews(
  status_filter?: string,
  limit: number = 20,
  offset: number = 0
): Promise<MemberReview[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (status_filter) {
    params.append("status_filter", status_filter);
  }

  const response = await fetch(
    `/api/member/my-reviews?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return response.json();
}

export async function createReview(
  reviewData: ReviewCreate
): Promise<MemberReview> {
  const response = await fetch("/api/member/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data?.error === "string" ? data.error : "Failed to create review"
    );
  }

  return response.json();
}

// School Request functions
export interface SchoolRequest {
  id: number;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  school_type?: string | null;
  board?: string | null;
  grade_levels?: string | null;
  enrollment?: number | null;
  student_teacher_ratio?: number | null;
  medium_of_instruction?: string | null;
  principal_name?: string | null;
  established_year?: number | null;
  member_id?: number | null;
  status: string;
  admin_notes?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface SchoolRequestCreate {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  school_type?: string;
  board?: string;
  grade_levels?: string;
  enrollment?: number;
  student_teacher_ratio?: number;
  medium_of_instruction?: string;
  principal_name?: string;
  established_year?: number;
}

export async function createSchoolRequest(
  data: SchoolRequestCreate
): Promise<SchoolRequest> {
  const response = await fetch("/api/member/school-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      typeof errorData?.detail === "string"
        ? errorData.detail
        : typeof errorData?.error === "string"
          ? errorData.error
          : "Failed to submit school request"
    );
  }

  return response.json();
}

export async function getMySchoolRequests(
  status?: string
): Promise<SchoolRequest[]> {
  const params = new URLSearchParams();
  if (status) {
    params.append("status", status);
  }

  const response = await fetch(
    `/api/member/school-requests?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch school requests");
  }

  return response.json();
}

