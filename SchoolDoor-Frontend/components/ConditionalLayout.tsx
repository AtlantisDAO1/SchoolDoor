"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer2 } from "@/components/Footer2";
import { ChatWidget } from "@/components/ChatWidget";
import { Header } from "./header/Header";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortalRoute = pathname?.startsWith("/portal");
  const isMemberRoute = pathname?.startsWith("/member");

  if (isPortalRoute || isMemberRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header/> 
      
      <div className="flex min-h-screen flex-col pt-20 md:pt-24">
        <div className="flex-1">{children}</div>
        <Footer2 />
      </div>
      <ChatWidget />
    </>
  );
}

