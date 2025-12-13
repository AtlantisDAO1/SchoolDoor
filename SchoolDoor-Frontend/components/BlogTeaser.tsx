export function BlogTeaser() {
  return (
    <section className="rounded-4xl bg-gradient-to-r from-sd-soft-pink via-white to-sd-soft-blue p-8 shadow-surface-md">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-sd-navy">
            Latest Insights from Our Blog
          </h2>
          <p className="mt-2 max-w-xl text-sm text-sd-muted">
            Expert interviews, curriculum explainers, and practical guides to
            help parents navigate schooling decisions.
          </p>
        </div>
        <a
          href="https://blog.schooldoor.in/blog"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-sd-salmon px-5 py-3 text-sm font-semibold text-white shadow-surface-sm transition hover:-translate-y-0.5 hover:bg-[#f97261]"
        >
          Visit Blog
          <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}
