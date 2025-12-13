import Link from "next/link";
import { HeroCarousel } from "./HeroCarousel";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden rounded-4xl bg-hero-gradient px-6 py-20 shadow-surface-lg sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16 lg:py-24">
      <div className="pointer-events-none absolute -left-10 top-12 hidden h-24 w-24 rotate-6 rounded-full border-[5px] border-dashed border-sd-yellow/60 sm:block" />

      <div className="relative max-w-xl space-y-6">
        <p className="inline-flex items-center rounded-full border border-sd-salmon/40 bg-white/80 px-5 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sd-salmon shadow-surface-sm">
          India&apos;s first AI-powered school discovery platform
        </p>
        <h1 className="font-heading text-4xl font-semibold leading-tight text-sd-navy sm:text-[3.25rem] sm:leading-tight">
          Find the right school & teachers
        </h1>
        <p className="text-base leading-7 text-sd-muted sm:text-lg">
          A citizen‑led movement where parents, teachers, and schools co‑create
          a transparent, trusted guide to education in India.
        </p>
        <div className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center">
          <Link
            href="/alfred"
            className="inline-flex items-center justify-center rounded-full bg-sd-salmon px-7 py-3 font-semibold text-white shadow-surface-sm transition hover:-translate-y-0.5 hover:bg-[#f97261]"
          >
            Co‑create with Alfred
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full border-2 border-sd-navy px-7 py-3 font-semibold text-sd-navy transition hover:-translate-y-0.5 hover:bg-sd-navy hover:text-white"
          >
            Join Early Circle
          </Link>
        </div>
      </div>

      <div className="relative mt-12 hidden shrink-0 grow basis-[40%] md:block">
        <div className="absolute -right-14 bottom-6 h-16 w-16 -rotate-12 rounded-3xl border-2 border-sd-salmon/40" />
        <div className="absolute -left-12 top-1/2 h-14 w-14 -translate-y-1/2 rotate-12 rounded-full bg-sd-soft-green/70" />
        <HeroCarousel />
      </div>
    </section>
  );
}
