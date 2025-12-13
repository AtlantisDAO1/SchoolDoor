import Link from "next/link";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: "/reviews", label: "Review Schools" },
  { href: "https://blog.schooldoor.in/blog", label: "Blog", external: true },
];

export function SiteHeader() {
  return (
    <div className="mx-auto w-full max-w-content px-5 pt-6 sm:px-6">
      <header className="sticky top-6 z-40 flex items-center justify-between rounded-full border border-white/30 bg-white/30 px-5 py-3 text-sm text-sd-muted shadow-surface-sm backdrop-blur-md">
        <Link href="/" className="text-lg font-semibold text-sd-navy">
          SCHOOLDOOR
        </Link>
        <nav aria-label="Primary navigation" className="hidden gap-6 sm:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="relative text-sm font-medium text-sd-muted transition hover:text-sd-navy after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-sd-navy after:transition hover:after:scale-x-100"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-sd-muted transition hover:text-sd-navy after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-sd-navy after:transition hover:after:scale-x-100"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/member/login"
            className="inline-flex items-center justify-center rounded-full border border-sd-navy/20 bg-white/80 px-4 py-2 text-sm font-semibold text-sd-navy shadow-surface-sm transition hover:-translate-y-0.5 hover:bg-white"
          >
            Member Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sd-navy to-[#13b5ad] px-5 py-2 text-sm font-semibold text-white shadow-surface-sm transition hover:-translate-y-0.5"
          >
            Join Early Circle
          </Link>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/member/login"
            className="inline-flex items-center justify-center rounded-full border border-sd-navy/20 bg-white/80 px-5 py-2 text-sm font-semibold text-sd-navy shadow-surface-sm transition hover:-translate-y-0.5 hover:bg-white"
          >
            Member Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sd-navy to-[#13b5ad] px-6 py-2 text-sm font-semibold text-white shadow-surface-sm transition hover:-translate-y-0.5"
          >
            Join Early Circle
          </Link>
        </div>
      </header>
    </div>
  );
}
