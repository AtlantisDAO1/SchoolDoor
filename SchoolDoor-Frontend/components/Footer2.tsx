import Link from "next/link";

const SOCIAL_LINKS = [
  {
    href: "https://x.com/Schooldoor_IND",
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
    href: "https://www.instagram.com/schooldoor_ind?igsh=Y3FjMDQ2ZGF4ejdw",
    label: "Instagram",
    icon: (
      <svg
  aria-hidden
  className="h-5 w-5"
  viewBox="0 0 24 24"
  fill="currentColor"
>
  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
</svg>
    ),
  },
];

export function Footer2() {
  return (
    <footer className="bg-teal-400 py-8 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Main content */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
          {/* Left side - Main content, social links, and login */}
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-inter font-bold text-black mb-4">
            Built with ♥ by Indian parents.
            </h3>
            
            {/* Subtext */}
            <div className="text-sm md:text-base text-black space-y-1 mb-6">
              <p>
                powered by{" "}
                <a 
                target="_blank"
                  href="https://www.dropchain.ai/" 
                  className="underline hover:no-underline font-medium"
                >
                  Anchor Protocol
                </a>
                , funded by
              </p>
              <p>
                <a 
                target="_blank"
                  href="https://www.malpaniventures.com/" 
                  className="underline hover:no-underline font-medium"
                >
                  Malpani Ventures
                </a>{" "}
                as a social impact initiative.
              </p>
            </div>

            {/* Social Links and Login Links */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Social Links */}
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-black transition hover:bg-black/20 hover:-translate-y-0.5"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Login Links */}
              <div className="flex gap-4 text-sm">
                <Link
                  href="/member/login"
                  className="font-medium text-black underline hover:no-underline transition"
                >
                  Member Login
                </Link>
                <Link
                  href="/portal/login"
                  className="font-medium text-black underline hover:no-underline transition"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>

          {/* Right side - Logo icons */}
          <div className="flex self-start lg:self-end justify-start lg:justify-end">
            <div className="flex items-center gap-2">
              <img 
                src="/images/plus.png" 
                alt="Plus" 
                className="w-6 h-6 object-contain"
              />
              <img 
                src="/images/circle.png" 
                alt="Circle" 
                className="w-6 h-6 object-contain"
              />
              <img 
                src="/images/multiply.png" 
                alt="Multiply" 
                className="w-6 h-6 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
