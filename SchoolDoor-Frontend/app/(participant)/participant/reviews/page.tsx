import { redirect } from "next/navigation";

// Redirect old participant routes to member routes
export default async function ParticipantReviewsPage() {
  redirect("/member/reviews");
}
