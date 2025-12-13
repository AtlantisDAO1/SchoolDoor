import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/member-auth";
import { backendFetch } from "@/lib/api-client";

type RouteParams = {
  params: Promise<{
    schoolId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams,
) {
  const { schoolId } = await params;
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 5;

  try {
    // Fetch only approved reviews for public view
    const response = await backendFetch(
      `/reviews?school_id=${schoolId}&public_only=true&limit=${Number.isFinite(limit) ? limit : 5}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    const data = await response.json();
    // Ensure we return an array
    const reviews = Array.isArray(data) ? data : (data.reviews || []);
    
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error(`Failed to fetch reviews for school ${schoolId}`, error);
    return NextResponse.json(
      { error: "Unable to load reviews." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteParams,
) {
  const { schoolId } = await params;
  const body = await request.json();

  // Check if user is authenticated
  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to submit a review." },
      { status: 401 },
    );
  }

  try {

    // Submit review with member authentication via members endpoint
    const response = await backendFetch("/members/reviews", {
      method: "POST",
      token: session.token,
      body: JSON.stringify({
        school_id: Number(schoolId),
        overall_rating: Number(body.overall_rating),
        content: body.content,
        is_anonymous: body.is_anonymous ?? false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Unable to submit review");
    }

    const review = await response.json();
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error(`Failed to submit review for school ${schoolId}`, error);
    const errorMessage = error instanceof Error ? error.message : "Unable to submit review.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
