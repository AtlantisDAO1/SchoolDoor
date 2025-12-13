import { redirect } from "next/navigation";

// Redirect old participant routes to member routes
export default async function ParticipantLayout() {
  redirect("/member/dashboard");
}

