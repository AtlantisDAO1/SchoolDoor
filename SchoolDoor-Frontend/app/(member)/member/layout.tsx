import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";
import { MemberShell } from "@/components/member/MemberShell";

type MemberLayoutProps = {
  children: ReactNode;
};

export default async function MemberLayout({
  children,
}: MemberLayoutProps) {
  const session = await getMemberSession();

  if (!session) {
    redirect("/member/login");
  }

  return <MemberShell user={session.user}>{children}</MemberShell>;
}

