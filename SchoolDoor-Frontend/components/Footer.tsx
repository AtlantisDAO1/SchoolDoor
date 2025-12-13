import Link from "next/link";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "https://www.schooldoor.in/blog", label: "Blog", external: true },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

const SOCIAL_LINKS = [
  {
    href: "https://twitter.com",
    label: "Twitter",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.312 6.183c.858-.573 1.514-1.397 1.824-2.329a8.01 8.01 0 01-2.562.978 3.963 3.963 0 00-2.866-1.235 3.977 3.977 0 00-3.972 3.972c0 .309.036.608.1.895-3.305-.164-6.233-1.75-8.195-4.16a3.944 3.944 0 00-.538 1.998 3.97 3.97 0 001.768 3.309 3.928 3.928 0 01-1.802-.498v.05a3.982 3.982 0 003.186 3.896 3.985 3.985 0 01-1.794.069 3.982 3.982 0 003.707 2.756 7.973 7.973 0 01-4.932 1.703c-.318 0-.635-.018-.95-.055A11.284 11.284 0 009.29 19.25c7.547 0 11.675-6.252 11.675-11.675 0-.18-.004-.362-.012-.542a8.331 8.331 0 001.99-2.1l-.002-.002z" />
      </svg>
    ),
  },
  {
    href: "https://linkedin.com",
    label: "LinkedIn",
    icon: (
      <svg
        aria-hidden
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.447 20.452H16.9V15.8c0-1.107-.021-2.532-1.544-2.532-1.546 0-1.783 1.205-1.783 2.449v4.735H10.03V9h3.4v1.561h.048c.474-.9 1.634-1.848 3.364-1.848 3.598 0 4.266 2.368 4.266 5.448v6.291zM5.337 7.433a1.97 1.97 0 110-3.94 1.97 1.97 0 010 3.94zM7.119 20.452H3.554V9h3.565v11.452z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="mt-24 rounded-4xl bg-white/80 p-10 text-sm text-sd-muted shadow-surface-md backdrop-blur">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-heading text-xl font-semibold text-sd-navy">
            SchoolDoor
          </p>
          <p className="mt-2 max-w-md text-sm">
            Building transparency in Indian schooling with AI-assisted analysis,
            verified data, and a thriving parent community.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-sd-ink transition hover:text-sd-salmon"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-sd-ink transition hover:text-sd-salmon"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex gap-3">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sd-navy/15 text-sd-navy transition hover:-translate-y-0.5 hover:border-sd-salmon/40 hover:bg-sd-soft-pink"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 text-xs text-sd-muted">
          <p>Built with ♥ by Indian parents.</p>
          <p>
            powered by Anchor Protocol, funded by Malpani Ventures as a social
            impact initiative
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Link
            href="/member/login"
            className="font-medium text-sd-ink transition hover:text-sd-salmon"
          >
            Member Login
          </Link>
          <span className="text-sd-muted">•</span>
          <Link
            href="/portal/login"
            className="font-medium text-sd-ink transition hover:text-sd-salmon"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
