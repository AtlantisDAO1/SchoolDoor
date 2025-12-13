"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import Link from "next/link";
import type { Review, School } from "@/lib/schooldoor-api";
import { useMemberSession } from "@/hooks/use-member-session";
import { LoginModal } from "@/components/auth/LoginModal";

type Props = {
  initialSchools: School[];
};

type ReviewsMap = Record<number, Review[]>;

export function ReviewsApp({ initialSchools }: Props) {
  const [query, setQuery] = useState("");
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<ReviewsMap>({});
  const [loadingReviews, setLoadingReviews] = useState<Record<number, boolean>>(
    {},
  );
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [ratingDraft, setRatingDraft] = useState<Record<number, number>>({});
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { session, loading: sessionLoading, refreshSession } = useMemberSession();

  const filteredSchools = useMemo(() => {
    if (!query.trim()) return initialSchools;
    const term = query.toLowerCase();
    return initialSchools.filter((school) => {
      const board = school.board ?? "";
      const city = school.city ?? "";
      return (
        school.name.toLowerCase().includes(term) ||
        board.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term)
      );
    });
  }, [initialSchools, query]);

  const PAGE_SIZE = 8;
  const totalResults = filteredSchools.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalResults / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const showingFrom = totalResults === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, totalResults);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (
      openCard !== null &&
      !paginatedSchools.some((school) => school.id === openCard)
    ) {
      setOpenCard(null);
    }
  }, [openCard, paginatedSchools]);

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    setOpenCard(null);
  };

  async function handleToggleReviews(schoolId: number) {
    setOpenCard((current) => (current === schoolId ? null : schoolId));
    const hasReviews = reviews[schoolId];
    if (hasReviews || loadingReviews[schoolId]) return;

    try {
      setLoadingReviews((state) => ({ ...state, [schoolId]: true }));
      const res = await fetch(`/api/schooldoor/reviews/${schoolId}`);
      if (!res.ok) throw new Error("Failed to load reviews.");
      const data = await res.json();
      setReviews((state) => ({ ...state, [schoolId]: data.reviews ?? [] }));
      setMessages((state) => ({ ...state, [schoolId]: "" }));
    } catch (error) {
      console.error(error);
      setMessages((state) => ({
        ...state,
        [schoolId]: "We couldn’t load reviews right now. Please try again.",
      }));
    } finally {
      setLoadingReviews((state) => ({ ...state, [schoolId]: false }));
    }
  }

  async function handleSubmitReview(
    schoolId: number,
    formData: FormData,
  ) {
    // Check if user is logged in
    if (!session) {
      setShowLoginModal(true);
      return false;
    }

    const content = formData.get("content")?.toString().trim() ?? "";
    const rating = ratingDraft[schoolId] ?? 0;

    if (!content || rating === 0) {
      setMessages((state) => ({
        ...state,
        [schoolId]: "Please share your experience and select a rating.",
      }));
      return false;
    }

    try {
      setSubmitting((state) => ({ ...state, [schoolId]: true }));
      setMessages((state) => ({ ...state, [schoolId]: "" }));

      const payload = {
        overall_rating: rating,
        content,
        is_anonymous: false,
      };

      const res = await fetch(`/api/schooldoor/reviews/${schoolId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Session expired, refresh and retry
          const refreshed = await refreshSession();
          if (!refreshed) {
            setShowLoginModal(true);
            return false;
          }
          // Retry with fresh session
          const retryRes = await fetch(`/api/schooldoor/reviews/${schoolId}`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          });
          if (!retryRes.ok) throw new Error("Unable to submit review");
        } else {
          throw new Error("Unable to submit review");
        }
      }

      setMessages((state) => ({
        ...state,
        [schoolId]: "Thank you! Your review is pending approval and will be visible after admin review.",
      }));
      setRatingDraft((state) => ({ ...state, [schoolId]: 0 }));
      await refreshReviews(schoolId);
      return true;
    } catch (error) {
      console.error(error);
      setMessages((state) => ({
        ...state,
        [schoolId]: "Something went wrong while sending your review.",
      }));
      return false;
    } finally {
      setSubmitting((state) => ({ ...state, [schoolId]: false }));
    }
  }

  async function refreshReviews(schoolId: number) {
    try {
      const res = await fetch(`/api/schooldoor/reviews/${schoolId}`);
      if (!res.ok) throw new Error("Failed to refresh reviews.");
      const data = await res.json();
      setReviews((state) => ({ ...state, [schoolId]: data.reviews ?? [] }));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={async () => {
          await refreshSession();
        }}
      />
      <section className="mt-10 space-y-8">
      {/* Add School Button (visible when logged in) */}
      {session && (
        <div className="flex justify-center">
          <Link
            href="/member/add-school"
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-surface-sm transition focus:outline-none focus:ring-2 focus:ring-sd-navy/20"
            style={{
              background: 'linear-gradient(to right, #0f9790, #13b5ad)',
              color: '#ffffff',
              textDecoration: 'none'
            }}
          >
            <span>+</span>
            Add School
          </Link>
        </div>
      )}
      <div className="relative mx-auto flex max-w-xl items-center rounded-full border border-sd-navy/10 bg-white px-5 py-3 shadow-surface-sm">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by school name, city, or board..."
          className="w-full border-0 bg-transparent text-sm text-sd-ink outline-none placeholder:text-sd-muted pr-8 sm:pr-20"
        />
        <span className="absolute right-5 text-xs font-semibold uppercase tracking-[0.3em] text-sd-muted hidden sm:block">
          Search
        </span>
        <span className="absolute right-5 text-base text-sd-muted sm:hidden">
          🔍
        </span>
      </div>

      <div className="space-y-6">
        {totalResults === 0 ? (
          <p className="rounded-3xl border border-sd-soft-blue/60 bg-sd-soft-blue/40 p-6 text-center text-sm text-sd-muted">
            No schools found. Try a different search term.
          </p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-3xl border border-white/60 bg-white/70 px-4 py-3 text-xs uppercase tracking-[0.3em] text-sd-muted">
              <span>
                Showing {showingFrom}-{showingTo} of {totalResults} schools
              </span>
              {totalPages > 1 && (
                <span className="text-xs">
                  Page {currentPage} / {totalPages}
                </span>
              )}
            </div>
            {paginatedSchools.map((school) => {
            const isOpen = openCard === school.id;
            const schoolReviews = reviews[school.id] ?? [];
            const message = messages[school.id];

            return (
              <article
                key={school.id}
                className="rounded-4xl border border-sd-navy/10 bg-white/90 p-6 shadow-surface-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-surface-md"
              >
                <div className="space-y-4">
                  <div>
                    <h2 className="font-heading text-xl text-sd-ink">
                      {school.name}
                    </h2>
                    <p className="mt-1 text-sm text-sd-muted">
                      {[school.city, school.state].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-sd-muted">
                      {school.board ?? "Board N/A"} ·{" "}
                      {school.school_type ?? "Type N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <span className="inline-flex items-center rounded-full bg-sd-yellow/70 px-4 py-2 text-sm font-semibold text-sd-ink">
                      ⭐{" "}
                      {typeof school.average_rating === "number"
                        ? school.average_rating.toFixed(1)
                        : "–"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleReviews(school.id)}
                      className="w-full sm:w-auto rounded-2xl px-6 py-3 text-sm font-semibold shadow-surface-sm transition focus:outline-none focus:ring-2 focus:ring-sd-navy/20"
                      style={{
                        backgroundColor: '#0f9790',
                        color: '#ffffff',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0c7e78';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0f9790';
                      }}
                    >
                      {isOpen ? "Hide reviews" : "View reviews"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-6 space-y-6">
                    {/* Member status display */}
                    {session && (
                      <div className="flex items-center gap-3 rounded-2xl border border-sd-soft-green/50 bg-sd-soft-green/30 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sd-navy text-white">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-sd-navy">
                            {session.user.full_name || session.user.email}
                          </p>
                          <p className="text-xs text-sd-muted">Ready to share your review</p>
                        </div>
                      </div>
                    )}

                    {!session && !sessionLoading && (
                      <div className="rounded-2xl border border-sd-soft-blue/50 bg-sd-soft-blue/30 p-4 text-center">
                        <p className="text-sm text-sd-muted">
                          Please{" "}
                          <button
                            type="button"
                            onClick={() => setShowLoginModal(true)}
                            className="font-semibold text-sd-navy underline hover:text-sd-salmon"
                          >
                            sign in
                          </button>{" "}
                          to post a review
                        </p>
                      </div>
                    )}

                    <form
                      key={school.id} // Ensure form is reset when school changes
                      className="space-y-4 rounded-3xl border border-sd-soft-blue/50 bg-sd-soft-blue/30 p-5"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        if (!session) {
                          setShowLoginModal(true);
                          return;
                        }
                        const form = event.currentTarget;
                        if (!form) return;
                        
                        const formData = new FormData(form);
                        const success = await handleSubmitReview(
                          school.id,
                          formData,
                        );
                        if (success) {
                          // Reset form fields manually to avoid null reference
                          // handleSubmitReview already clears the ratingDraft
                          try {
                            const contentField = form.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                            if (contentField) {
                              contentField.value = '';
                            }
                          } catch (err) {
                            // Form may have been unmounted, ignore
                            console.warn("Could not reset form field:", err);
                          }
                        }
                      }}
                    >
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted">
                          Rating
                        </label>
                        <div className="mt-2 flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((value) => {
                            const active =
                              (ratingDraft[school.id] ?? 0) >= value;
                            return (
                              <button
                                key={value}
                                type="button"
                                aria-label={`Rate ${value} star${
                                  value > 1 ? "s" : ""
                                }`}
                                onClick={() =>
                                  setRatingDraft((state) => ({
                                    ...state,
                                    [school.id]: value,
                                  }))
                                }
                                className="text-xl transition cursor-pointer hover:scale-110 focus:outline-none"
                                style={{
                                  color: active ? '#fbbf24' : '#d1d5db'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#fbbf24';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = active ? '#fbbf24' : '#d1d5db';
                                }}
                              >
                                ★
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted">
                          Share your experience
                        </label>
                        <textarea
                          name="content"
                          rows={4}
                          placeholder="How was your experience with this school?"
                          className="mt-2 w-full rounded-xl border border-sd-navy/15 bg-white px-3 py-2 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-sd-muted">
                          Your review will be submitted for admin approval before being visible to the community.
                        </p>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={submitting[school.id] || !session || sessionLoading}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold shadow-surface-sm transition focus:outline-none focus:ring-2 focus:ring-sd-salmon/20 disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                              backgroundColor: '#fc8a7b',
                              color: '#ffffff',
                              border: 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!submitting[school.id] && session && !sessionLoading) {
                                e.currentTarget.style.backgroundColor = '#f97066';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!submitting[school.id] && session && !sessionLoading) {
                                e.currentTarget.style.backgroundColor = '#fc8a7b';
                              }
                            }}
                          >
                            {submitting[school.id] ? "Submitting…" : session ? "Submit Review" : "Sign in to Submit"}
                          </button>
                        </div>
                      </div>

                      {message && (
                        <p
                          className={`text-sm ${
                            message.toLowerCase().includes("thank")
                              ? "text-sd-navy"
                              : "text-sd-salmon"
                          }`}
                        >
                          {message}
                        </p>
                      )}
                    </form>

                    <section className="space-y-4">
                      <h3 className="font-heading text-lg text-sd-navy">
                        Community reviews
                      </h3>
                      {loadingReviews[school.id] ? (
                        <p className="text-sm text-sd-muted">
                          Fetching latest reviews…
                        </p>
                      ) : schoolReviews.length === 0 ? (
                        <p className="rounded-3xl border border-dashed border-sd-navy/20 bg-white/70 p-6 text-sm text-sd-muted">
                          No reviews yet. Be the first to share your experience.
                        </p>
                      ) : (
                        <ul className="space-y-4">
                          {schoolReviews.map((review) => (
                            <li
                              key={review.id}
                              className="rounded-3xl border border-sd-navy/10 bg-white/80 p-5 shadow-surface-sm"
                            >
                              <p className="text-sm text-sd-ink">
                                {review.content}
                              </p>
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-sd-muted">
                                <span>⭐ {review.overall_rating}</span>
                                <span>
                                  {(review as any).member?.full_name || review.parent_name || "Anonymous parent"}
                                </span>
                                {review.created_at && (
                                  <time dateTime={review.created_at}>
                                    {new Date(
                                      review.created_at,
                                    ).toLocaleDateString()}
                                  </time>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  </div>
                )}
              </article>
            );
            })}
          </>
        )}
      </div>

      {totalPages > 1 && totalResults > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-2xl border border-sd-navy/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted transition hover:text-sd-navy hover:bg-sd-soft-blue/30 focus:outline-none focus:ring-2 focus:ring-sd-navy/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            const isActive = pageNumber === currentPage;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => goToPage(pageNumber)}
                className={`h-10 w-10 rounded-2xl text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-sd-navy/20 ${
                  isActive
                    ? "shadow-surface-sm"
                    : "border border-sd-navy/15 text-sd-muted hover:text-sd-navy hover:bg-sd-soft-blue/30"
                }`}
                style={isActive ? {
                  backgroundColor: '#0f9790',
                  color: '#ffffff'
                } : {}}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-2xl border border-sd-navy/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted transition hover:text-sd-navy hover:bg-sd-soft-blue/30 focus:outline-none focus:ring-2 focus:ring-sd-navy/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
    </>
  );
}
