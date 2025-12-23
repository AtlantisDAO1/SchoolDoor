import type { Metadata } from "next";
import { Suspense } from "react";
import ReviewsListContainer from "./ReviewsListContainer";
import { ReviewsSkeleton } from "@/components/skeletons/ReviewsSkeleton";

export const metadata: Metadata = {
  title: "School Reviews | SchoolDoor",
  description:
    "Read and share verified parent reviews for schools near you. Search by name, city, or board.",
};

export default function ReviewsPage() {
  return (
    <main className="mx-auto w-full max-w-content px-5 pt-0 md:py-16 sm:px-6 md:px-16">
      <div className="rounded-4xl bg-white/85 py-10 shadow-surface-md backdrop-blur">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sd-salmon">
            Community voices
          </p>
          <h1 className="mt-3 font-heading text-3xl text-sd-navy sm:text-4xl">
            School Reviews
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-sd-muted sm:text-base">
            Discover what parents are saying about schools across India. Search
            by name, city, or board and add your own experience to help other
            families choose confidently.
          </p>
        </header>

        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsListContainer />
        </Suspense>
      </div>
    </main>
  );
}
