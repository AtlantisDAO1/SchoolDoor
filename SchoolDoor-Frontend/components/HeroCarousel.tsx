"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = {
  name: string;
  location: string;
  board: string;
  rating: string;
  fees: string;
  badge: string;
  background: string;
  icon: string;
};

const SLIDES: Slide[] = [
  {
    name: "Bloomfield High School",
    location: "Bengaluru • 12 km away",
    board: "CBSE",
    rating: "4.8",
    fees: "₹1.4L / year",
    badge: "Top Rated",
    background:
      "linear-gradient(145deg, rgba(255, 227, 215, 0.95), rgba(255, 247, 241, 0.9))",
    icon: "/globe.svg",
  },
  {
    name: "Oakridge International",
    location: "Hyderabad • 8 km away",
    board: "IB",
    rating: "4.7",
    fees: "₹1.9L / year",
    badge: "AI Match 92%",
    background:
      "linear-gradient(150deg, rgba(232, 241, 255, 0.95), rgba(246, 254, 251, 0.9))",
    icon: "/window.svg",
  },
  {
    name: "Lotus Valley Public",
    location: "Gurugram • 4 km away",
    board: "CBSE",
    rating: "4.6",
    fees: "₹1.1L / year",
    badge: "Verified • Admissions Open",
    background:
      "linear-gradient(150deg, rgba(255, 240, 221, 0.95), rgba(255, 227, 215, 0.9))",
    icon: "/file.svg",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((index) => (index + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[360px] select-none">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-sd-navy/15 bg-white/90 shadow-surface-lg backdrop-blur">
        {SLIDES.map((slide, index) => (
          <article
            key={slide.name}
            className={`absolute inset-0 flex flex-col justify-between gap-6 p-6 transition-all duration-700 ease-in-out ${
              index === active
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
            style={{ background: slide.background }}
            aria-hidden={index !== active}
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.26em] text-sd-muted">
                  Shortlisted School
                </p>
                <p className="mt-1 font-heading text-xl text-sd-ink">
                  {slide.name}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sd-salmon shadow-surface-sm">
                {slide.badge}
              </span>
            </header>

            <div className="space-y-3 rounded-3xl border border-white/80 bg-white/75 p-4 shadow-surface-sm">
              <div className="flex items-center justify-between text-sm text-sd-muted">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sd-soft-blue">
                    <Image src={slide.icon} alt="" width={18} height={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-sd-muted">
                      {slide.board}
                    </p>
                    <p className="text-sm font-medium text-sd-ink">
                      {slide.location}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-sd-navy">
                  {slide.rating} ⭐
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-sd-muted">
                <div className="rounded-2xl border border-sd-soft-blue/80 bg-sd-soft-blue/50 px-3 py-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.3em]">
                    Annual Fees
                  </p>
                  <p className="font-heading text-base text-sd-navy">
                    {slide.fees}
                  </p>
                </div>
                <div className="rounded-2xl border border-sd-soft-pink/80 bg-sd-soft-pink/50 px-3 py-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.3em]">
                    Parent Reviews
                  </p>
                  <p className="font-heading text-base text-sd-navy">436</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
