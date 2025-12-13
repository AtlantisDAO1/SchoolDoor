import { redirect } from "next/navigation";

// Redirect old participant routes to member routes
export default async function ParticipantSignupPage() {
  redirect("/member/signup");
}

