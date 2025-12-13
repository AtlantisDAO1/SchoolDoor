import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  // For admin, always fetch all reviews (not just public/approved ones)
  const adminQueryParams = new URLSearchParams(searchParams);
  adminQueryParams.set("public_only", "false"); // Admin can see all reviews
  
  const queryString = adminQueryParams.toString();
  const path = `/reviews${queryString ? `?${queryString}` : "?public_only=false"}`;

  const response = await backendFetch(path, {
    method: "GET",
    token: session.token,
  });

  const data = await response.json();
  
  // Add school names to reviews if not present
  if (Array.isArray(data)) {
    // Try to get schools list to map school_id to school_name
    const schoolsResponse = await backendFetch("/schools?limit=1000", {
      method: "GET",
      token: session.token,
    });
    
    if (schoolsResponse.ok) {
      const schools = await schoolsResponse.json();
      const schoolsMap = new Map(schools.map((s: any) => [s.id, s.name]));
      
      const enrichedData = data.map((review: any) => ({
        ...review,
        rating: review.overall_rating || review.rating,
        // Use member info if available, otherwise fall back to parent_name/parent_email
        reviewer_name: review.member?.full_name || review.parent_name || review.reviewer_name || "Anonymous",
        reviewer_email: review.member?.email || review.parent_email || review.reviewer_email || null,
        comment: review.content || review.comment || "",
        school_name: review.school_name || schoolsMap.get(review.school_id) || "Unknown School",
      }));
      
      return NextResponse.json(enrichedData, { status: response.status });
    }
  }
  
  return NextResponse.json(data, { status: response.status });
}

