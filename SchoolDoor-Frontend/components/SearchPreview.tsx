const SAMPLE_SCHOOLS = [
  {
    name: "Greenfield International School",
    board: "IB • ICSE",
    rating: "4.8",
    fees: "₹1.6L / year",
  },
  {
    name: "Lotus Valley Public School",
    board: "CBSE",
    rating: "4.6",
    fees: "₹1.1L / year",
  },
  {
    name: "Vidya Roots Academy",
    board: "State Board",
    rating: "4.4",
    fees: "₹85K / year",
  },
];

export function SearchPreview() {
  return (
    <section className="rounded-4xl border border-sd-navy/10 bg-white/85 p-8 shadow-surface-md backdrop-blur">
      <header className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-sd-navy">
          Preview Our AI-Powered Intelligent Search
        </h2>
        <p className="text-sm text-sd-muted">
          AI-powered recommendations help you filter by board, fees, distance, and hundreds of verified data points.
        </p>
      </header>

      <div className="mt-6 space-y-6">
        <div className="relative flex items-center gap-3 rounded-full border border-sd-navy/15 bg-sd-soft-blue px-5 py-3 text-sd-muted">
          <svg
            aria-hidden
            className="h-5 w-5 text-sd-navy"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5a6 6 0 104.472 10.028l4.25 4.25a1.5 1.5 0 002.122-2.122l-4.25-4.25A6 6 0 0011 5z"
            />
          </svg>
          <span className="text-sm sm:text-base">Search for a school…</span>
          <span className="ml-auto hidden rounded-full bg-white px-4 py-1 text-xs font-medium text-sd-salmon shadow sm:inline-flex">
            Coming Soon
          </span>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_SCHOOLS.map((school) => (
            <li key={school.name}>
              <article className="flex h-full flex-col rounded-3xl border border-sd-navy/10 bg-white p-5 shadow-surface-sm transition hover:-translate-y-1 hover:border-sd-salmon/40 hover:shadow-surface-md">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sd-soft-pink text-sm font-semibold text-sd-salmon">
                    {school.rating}
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-heading text-base font-semibold text-sd-ink">
                      {school.name}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-sd-muted">
                      {school.board}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 flex items-center justify-between text-xs text-sd-muted">
                  <div>
                    <dt className="font-medium text-sd-ink">Fees</dt>
                    <dd>{school.fees}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-sd-ink">Admissions</dt>
                    <dd>Verified</dd>
                  </div>
                </dl>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
