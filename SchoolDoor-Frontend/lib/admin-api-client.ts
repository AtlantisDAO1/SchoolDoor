/**
 * Client-side admin API functions (calls Next.js API routes)
 * This file can be safely imported in client components.
 * It provides typed wrappers around the admin-facing API endpoints.
 */


export interface SchoolQueryParams {
  limit?: number;
  offset?: number;
  query?: string;
  city?: string;
  state?: string;
  school_type?: string;
  board?: string;
  medium_of_instruction?: string;
  min_rating?: number;
  max_rating?: number;
}

export interface SchoolRow {
  id: number;
  name: string;
  city: string;
  state: string;
  school_type: string;
  board: string;
  average_rating: number;
  total_reviews: number;
  is_active: boolean;
  website?: string;
  address?: string;
}

export interface ScrapingJob {
  id: number;
  region: string;
  status: string;
  created_at: string;
  error_message?: string;
  schools_found?: number;
  schools_processed?: number;
  schools_created?: number;
  completed_at?: string;
}

export interface SchoolStatsSummary {
  total_schools: number;
  average_rating: number;
  schools_by_type: Record<string, number>;
  schools_by_state: Record<string, number>;
  top_rated_schools: Array<{
    id: number;
    name: string;
    city?: string;
    state?: string;
    average_rating?: number;
    total_reviews?: number;
  }>;
}

export interface SearchSuggestionItem {
  type: string;
  value: string;
  count: number;
}

export interface ExportResponse {
  download_url: string;
  file_name: string;
}

export interface BulkUpdateResponse {
  updated_count: number;
  failed_count: number;
  errors: Array<{ school_id: number; error: string }>;
}

// Client-side API functions that call Next.js API routes
export async function getSchools(
  params: SchoolQueryParams = {},
): Promise<SchoolRow[]> {
  const queryParams = new URLSearchParams();

  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.offset) queryParams.append("offset", params.offset.toString());
  if (params.query) queryParams.append("query", params.query);
  if (params.city) queryParams.append("city", params.city);
  if (params.state) queryParams.append("state", params.state);
  if (params.school_type)
    queryParams.append("school_type", params.school_type);
  if (params.board) queryParams.append("board", params.board);
  if (params.medium_of_instruction)
    queryParams.append("medium_of_instruction", params.medium_of_instruction);
  if (params.min_rating !== undefined)
    queryParams.append("min_rating", params.min_rating.toString());
  if (params.max_rating !== undefined)
    queryParams.append("max_rating", params.max_rating.toString());

  const queryString = queryParams.toString();
  const url = `/api/admin/schools${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch schools");
  }

  return response.json();
}

export async function getSchoolStats(): Promise<SchoolStatsSummary> {
  const response = await fetch("/api/admin/schools/stats", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch school stats");
  }

  return response.json();
}

export async function getSchoolSearchSuggestions(
  query: string,
  limit: number = 5,
): Promise<SearchSuggestionItem[]> {
  const response = await fetch(
    `/api/admin/schools/search-suggestions?query=${encodeURIComponent(query)}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch search suggestions");
  }

  return response.json();
}

export async function getScrapingJobsList(
  limit: number = 20,
  offset: number = 0,
): Promise<ScrapingJob[]> {
  const response = await fetch(
    `/api/admin/scraping/jobs?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch scraping jobs");
  }

  return response.json();
}

export async function startScrapingJob(region: string): Promise<ScrapingJob> {
  const response = await fetch("/api/admin/scraping/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ region }),
  });

  if (!response.ok) {
    throw new Error("Failed to start scraping job");
  }

  return response.json();
}

export async function exportSchools(
  payload: {
    format: string;
    school_ids?: number[];
    filters?: SchoolQueryParams;
    fields?: string[];
    include_reviews?: boolean;
    include_ratings?: boolean;
  },
): Promise<ExportResponse> {
  const response = await fetch("/api/admin/schools/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to export schools");
  }

  return response.json();
}

export async function bulkUpdateSchools(
  payload: {
    school_ids: number[];
    updates: Record<string, unknown>;
  },
): Promise<BulkUpdateResponse> {
  const response = await fetch("/api/admin/schools/bulk-update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to bulk update schools");
  }

  return response.json();
}

// Users API
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  last_login: string | null;
}

export interface AdminUserCreate {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  is_superuser?: boolean;
}

export interface AdminUserUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  password?: string;
}

export async function getUsers(): Promise<AdminUser[]> {
  const response = await fetch("/api/admin/users", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export async function createUser(
  payload: AdminUserCreate,
): Promise<AdminUser> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to create user");
  }

  return response.json();
}

export async function updateUser(
  id: number,
  payload: AdminUserUpdate,
): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to update user");
  }

  return response.json();
}

// Reviews API
export interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  reviewer_email: string;
  school_id: number;
  school_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewQueryParams {
  limit?: number;
  offset?: number;
  school_id?: number;
  rating?: number;
  status?: string;
}

export async function getReviews(
  params: ReviewQueryParams = {},
): Promise<Review[]> {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.offset) queryParams.append("offset", params.offset.toString());
  if (params.school_id)
    queryParams.append("school_id", params.school_id.toString());
  if (params.rating) queryParams.append("rating", params.rating.toString());
  if (params.status) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const url = `/api/admin/reviews${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return response.json();
}

export async function approveReview(reviewId: number): Promise<void> {
  const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
    method: "PUT",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to approve review");
  }
}

export async function rejectReview(reviewId: number): Promise<void> {
  const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
    method: "PUT",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to reject review");
  }
}

export async function getSchoolsForReviews(): Promise<
  Array<{ id: number; name: string }>
> {
  const response = await fetch("/api/admin/schools?limit=100", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch schools");
  }

  return response.json();
}

// School Requests API
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

export async function getSchoolRequests(
  status?: string
): Promise<SchoolRequest[]> {
  const params = new URLSearchParams();
  if (status) {
    params.append("status_filter", status);
  }

  const response = await fetch(`/api/admin/school-requests?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch school requests");
  }

  return response.json();
}

export async function approveSchoolRequest(
  requestId: number,
  adminNotes?: string
): Promise<void> {
  const response = await fetch(`/api/admin/school-requests/${requestId}/approve`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ admin_notes: adminNotes }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      typeof errorData?.detail === "string"
        ? errorData.detail
        : "Failed to approve school request"
    );
  }
}

export async function rejectSchoolRequest(
  requestId: number,
  adminNotes?: string
): Promise<void> {
  const response = await fetch(`/api/admin/school-requests/${requestId}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ admin_notes: adminNotes }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      typeof errorData?.detail === "string"
        ? errorData.detail
        : "Failed to reject school request"
    );
  }
}

// API Keys API
export interface APIKey {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
  created_by_admin_id: number;
}

export interface APIKeyCreate {
  name: string;
  description?: string;
  expires_days?: number;
}

export interface APIKeyUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface APIKeyStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  unique_endpoints: number;
  last_used: string | null;
  usage_by_endpoint: Array<{
    endpoint: string;
    method: string;
    count: number;
    success_rate: number;
  }>;
}

export interface APIKeyUsage {
  id: number;
  endpoint: string;
  method: string;
  ip_address: string | null;
  user_agent: string | null;
  response_status: number | null;
  created_at: string;
}

export interface APIKeyOverallStats {
  total_keys: number;
  active_keys: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
}

export interface APIKeyGenerateResponse {
  api_key: string;
  message: string;
}

export async function getAPIKeys(): Promise<APIKey[]> {
  const response = await fetch("/api/admin/api-keys", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch API keys");
  }

  return response.json();
}

export async function createAPIKey(
  payload: APIKeyCreate,
): Promise<APIKeyGenerateResponse> {
  const response = await fetch("/api/admin/api-keys/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create API key");
  }

  return response.json();
}

export async function updateAPIKey(
  id: number,
  payload: APIKeyUpdate,
): Promise<APIKey> {
  const response = await fetch(`/api/admin/api-keys/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update API key");
  }

  return response.json();
}

export async function activateAPIKey(id: number): Promise<void> {
  const response = await fetch(`/api/admin/api-keys/${id}/activate`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to activate API key");
  }
}

export async function deactivateAPIKey(id: number): Promise<void> {
  const response = await fetch(`/api/admin/api-keys/${id}/deactivate`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to deactivate API key");
  }
}

export async function deleteAPIKey(id: number): Promise<void> {
  const response = await fetch(`/api/admin/api-keys/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete API key");
  }
}

export async function getAPIKeyStats(id: number): Promise<APIKeyStats> {
  const response = await fetch(`/api/admin/api-keys/${id}/stats`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch API key stats");
  }

  return response.json();
}

export async function getAPIKeyUsage(
  id: number,
  limit: number = 50,
): Promise<APIKeyUsage[]> {
  const response = await fetch(
    `/api/admin/api-keys/${id}/usage?limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch API key usage");
  }

  return response.json();
}

export async function getAPIKeyOverallStats(): Promise<APIKeyOverallStats> {
  const response = await fetch("/api/admin/api-keys/stats/overview", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch overall API key stats");
  }

  return response.json();
}

