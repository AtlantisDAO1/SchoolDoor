import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";
import { MemberSignupForm } from "@/components/auth/MemberSignupForm";
import { Header } from "@/components/header/Header";

export const metadata: Metadata = {
  title: "SchoolDoor Member Signup",
};

export default async function MemberSignupPage() {
  const session = await getMemberSession();
  if (session) {
    redirect("/member/dashboard");
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sd-soft-blue/60 to-sd-soft-pink/60 px-6 py-12 pt-24">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-surface-lg">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sd-salmon">
              SchoolDoor Member Portal
            </p>
            <h1 className="mt-3 font-heading text-2xl text-sd-navy">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-sd-muted">
              Join the SchoolDoor community to share your insights.
            </p>
          </div>
          <MemberSignupForm />
        </div>
      </div>
    </>
  );
}

