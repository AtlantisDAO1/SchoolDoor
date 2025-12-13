"use client";

import {
  Home,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { MemberUser } from "@/lib/member-auth";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/member/dashboard", icon: Home },
  { name: "My Reviews", href: "/member/reviews", icon: MessageSquare },
  { name: "Profile", href: "/member/profile", icon: User },
];

type MemberShellProps = {
  user: MemberUser;
  children: React.ReactNode;
};

export function MemberShell({ user, children }: MemberShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    await fetch("/api/member/logout", {
      method: "POST",
    });
    router.replace("/");
    router.refresh();
  };

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sd-navy/20 ${
          active
            ? "shadow-surface-sm"
            : "text-sd-muted hover:bg-sd-soft-blue/40 hover:text-sd-navy"
        }`}
        style={active ? {
          backgroundColor: '#0f9790',
          color: '#ffffff'
        } : {}}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-sd-cream font-body text-sd-ink">
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-sd-navy/10 bg-white px-6 py-8 shadow-surface-lg transition lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/plus.png" 
                alt="Plus" 
                className="w-4 h-4 object-contain"
              />
              <img 
                src="/images/circle.png" 
                alt="Circle" 
                className="w-4 h-4 object-contain"
              />
              <img 
                src="/images/multiply.png" 
                alt="Multiply" 
                className="w-4 h-4 object-contain"
              />
            </div>
            <span className="font-heading text-lg text-sd-navy">
              SCHOOLDOOR
            </span>
          </Link>
          <button
            className="rounded-full bg-sd-soft-blue p-2 text-sd-navy lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-2">
          {navigation.map(renderNavItem)}
        </nav>

        <div className="mt-6 rounded-2xl border border-sd-navy/15 bg-sd-soft-blue/30 p-5 text-sm">
          <p className="font-semibold text-sd-navy">{user.full_name || user.email}</p>
          <p className="mt-1 text-xs text-sd-muted">{user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-4 inline-flex items-center rounded-2xl px-3 py-2 text-xs font-semibold transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-sd-salmon/20"
            style={{
              backgroundColor: '#fc8a7b',
              color: '#ffffff',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f97261';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fc8a7b';
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/60 bg-white px-5 py-3 shadow-surface-sm lg:hidden">
          <button
            className="rounded-2xl border border-sd-navy/15 bg-white p-2 text-sd-navy"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <img 
                src="/images/plus.png" 
                alt="Plus" 
                className="w-3 h-3 object-contain"
              />
              <img 
                src="/images/circle.png" 
                alt="Circle" 
                className="w-3 h-3 object-contain"
              />
              <img 
                src="/images/multiply.png" 
                alt="Multiply" 
                className="w-3 h-3 object-contain"
              />
            </div>
            <span className="font-heading text-base text-sd-navy">
              SCHOOLDOOR
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-sd-muted">
            <span>{user.full_name || user.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-sd-navy/20 px-3 py-1 text-xs font-semibold transition hover:bg-sd-soft-blue/30 focus:outline-none focus:ring-2 focus:ring-sd-navy/20"
              style={{
                color: '#0f9790',
                borderColor: '#0f9790'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="px-5 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

