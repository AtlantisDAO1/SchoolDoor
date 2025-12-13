import Link from "next/link";

export function ExpertCommunity() {
  return (
    <section className="rounded-4xl border-2 border-sd-navy/15 bg-white/90 p-8 shadow-surface-md">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <h2 className="font-heading text-3xl font-semibold text-sd-navy">
          Join the SchoolDoor Expert Community
        </h2>
        <p className="text-base font-medium text-sd-muted">
          Be a guiding voice for parents and schools.
        </p>
        <p className="text-sm leading-6 text-sd-muted">
          At SchoolDoor, we&apos;re building a network of educators, psychologists,
          and thought leaders who can support parents through meaningful insights,
          workshops, and conversations. Fill out this form to collaborate,
          contribute, and help shape a more informed and empathetic schooling
          ecosystem
        </p>
        <Link
          href="/expert-signup"
          className="inline-flex items-center justify-center rounded-full bg-sd-navy px-8 py-3 text-sm font-semibold text-white shadow-surface-sm transition hover:-translate-y-0.5 hover:bg-[#13b5ad]"
        >
          Sign up as an Expert
        </Link>
      </div>
    </section>
  );
}
