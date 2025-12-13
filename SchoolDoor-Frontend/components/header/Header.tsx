"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
  highlighted?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: "/reviews", label: "Review Schools" },
//   { href: "/build-with-us", label: "Build with us" },
//   { href: "/contact", label: "Contact" },
  { href: "https://blog.schooldoor.in/blog", label: "Blog", external: true },
];

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="fixed top-0 left-0 right-0 z-50 w-full">
            <header className="bg-[#fafafa] border-b border-gray-200 flex items-center justify-between px-6 md:px-24 py-4 md:py-7 text-sm text-sd-muted">
                {/* Logo Section */}
                <Link href="/" className="flex items-center space-x-3 md:space-x-6">
                    <div className="flex items-center space-x-2">
                        <img 
                            src="/images/plus.png" 
                            alt="Plus" 
                            className="w-4 h-4 md:w-5 md:h-5 object-contain"
                        />
                        <img 
                            src="/images/circle.png" 
                            alt="Circle" 
                            className="w-4 h-4 md:w-5 md:h-5 object-contain"
                        />
                        <img 
                            src="/images/multiply.png" 
                            alt="Multiply" 
                            className="w-4 h-4 md:w-5 md:h-5 object-contain"
                        />
                    </div>
                    <span className="text-lg md:text-2xl text-black">
                        SCHOOLDOOR
                    </span>
                </Link>

                {/* Desktop Navigation Menu */}
                <nav aria-label="Primary navigation" className="hidden md:flex gap-6">
                    {NAV_LINKS.map((link) =>
                        link.external ? (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className={`relative text-[.94rem] transition hover:text-sd-navy after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-sd-navy after:transition hover:after:scale-x-100 ${
                                    pathname === link.href ? 'text-orange-400 hover:text-orange-500' : 'text-black'
                                }`}
                            >
                                {link.label}
                            </a>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative text-[.94rem] font-medium transition hover:text-sd-navy after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:bg-sd-navy after:transition hover:after:scale-x-100 ${
                                    pathname === link.href ? 'text-orange-400 hover:text-orange-500' : 'text-black'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ),
                    )}
                </nav>

                {/* Mobile Hamburger Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden flex flex-col items-center justify-center w-8 h-8 relative"
                    aria-label="Toggle menu"
                >
                    <span className={`w-6 h-0.5 bg-black transition-all duration-300 absolute ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
                    <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`w-6 h-0.5 bg-black transition-all duration-300 absolute ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
                </button>
            </header>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden fixed top-[73px] left-0 right-0 bg-[#fafafa] border-b border-gray-200 shadow-lg">
                    <nav className="px-6 py-4 space-y-4">
                        {NAV_LINKS.map((link) =>
                            link.external ? (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`block text-base font-medium transition hover:text-sd-navy ${
                                        pathname === link.href ? 'text-orange-400 hover:text-orange-500' : 'text-black'
                                    }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block text-base font-medium transition hover:text-sd-navy ${
                                        pathname === link.href ? 'text-orange-400 hover:text-orange-500' : 'text-black'
                                    }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ),
                        )}
                    </nav>
                </div>
            )}
        </div>
    );
};
