import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Header } from "@/components/header/Header";

export const metadata: Metadata = {
  title: "SchoolDoor Admin Login",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/portal/dashboard");
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sd-soft-blue/60 to-sd-soft-pink/60 px-6 py-12 pt-24">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-surface-lg">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sd-salmon">
              SchoolDoor Admin Portal
            </p>
            <h1 className="mt-3 font-heading text-2xl text-sd-navy">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-sd-muted">
              Sign in with your admin credentials to manage SchoolDoor.
            </p>
          </div>

          <AdminLoginForm />
        </div>
      </div>
    </>
  );
}
