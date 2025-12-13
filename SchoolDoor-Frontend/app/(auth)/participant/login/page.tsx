import { redirect } from "next/navigation";

// Redirect old participant routes to member routes
export default async function ParticipantLoginPage() {
  redirect("/member/login");
}

