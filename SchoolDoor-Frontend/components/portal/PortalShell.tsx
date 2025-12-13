"use client";

import {
  BarChart3,
  Key,
  LogOut,
  Menu,
  MessageSquare,
  School,
  Users,
  Home,
  X,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminUser } from "@/lib/auth";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/portal/dashboard", icon: Home },
  { name: "Schools", href: "/portal/schools", icon: School },
  { name: "School Requests", href: "/portal/school-requests", icon: Building2 },
  { name: "Analytics", href: "/portal/analytics", icon: BarChart3 },
  { name: "Reviews", href: "/portal/reviews", icon: MessageSquare },
  { name: "API Keys", href: "/portal/api-keys", icon: Key },
  { name: "Users", href: "/portal/users", icon: Users },
];

type PortalShellProps = {
  user: AdminUser;
  children: React.ReactNode;
};

export function PortalShell({ user, children }: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });
    router.replace("/portal/login");
    router.refresh();
  };

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${
          active
            ? "bg-sd-navy text-white"
            : "text-sd-muted hover:bg-sd-soft-blue/60 hover:text-sd-navy"
        } group flex items-center rounded-2xl px-3 py-2 text-sm font-medium transition`}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  const userRoleLabel = user.is_superuser ? "Super Admin" : "Admin";

  return (
    <div className="min-h-screen bg-sd-cream font-body text-sd-ink">
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-white/60 bg-white px-5 py-6 shadow-surface-sm transition lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="font-heading text-xl text-sd-navy">
            SchoolDoor Admin
          </p>
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

        <div className="mt-6 rounded-2xl border border-sd-soft-blue/60 bg-sd-soft-blue/40 p-4 text-sm">
          <p className="font-semibold">{user.full_name || user.username}</p>
          <p className="mt-1 text-xs text-sd-muted">{user.email}</p>
          <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-sd-navy">
            {userRoleLabel}
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 inline-flex items-center rounded-2xl bg-sd-salmon px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#f97261]"
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
          <p className="font-heading text-lg text-sd-navy">
            SchoolDoor Admin
          </p>
          <div className="flex items-center gap-3 text-xs text-sd-muted">
            <span>{user.username}</span>
            <button
              onClick={handleLogout}
              className="rounded-full border border-sd-navy/20 px-2 py-1 text-xs font-semibold text-sd-navy"
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
