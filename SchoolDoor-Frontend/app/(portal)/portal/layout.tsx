import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { PortalShell } from "@/components/portal/PortalShell";

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/portal/login");
  }

  return <PortalShell user={session.user}>{children}</PortalShell>;
}
