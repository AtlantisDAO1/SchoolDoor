import { NextResponse } from "next/server";
import { fetchSchools } from "@/lib/schooldoor-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 100;

  try {
    const schools = await fetchSchools(Number.isFinite(limit) ? limit : 100);
    return NextResponse.json({ schools });
  } catch (error) {
    console.error("Failed to fetch schools", error);
    return NextResponse.json(
      { error: "Unable to load schools." },
      { status: 500 },
    );
  }
}
