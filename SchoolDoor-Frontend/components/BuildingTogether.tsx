export function BuildingTogether() {
  const steps = [
    {
      number: "1",
      title: "Listen",
      description:
        "Collect stories, concerns, and wish‑lists from families and educators.",
    },
    {
      number: "2",
      title: "Co‑design",
      description:
        "Sketch Version 1.0 of SchoolDoor based on what you say.",
    },
    {
      number: "3",
      title: "Launch & Iterate",
      description:
        "Release the first community‑moderated directory; refine it as more voices join",
    },
  ];

  return (
    <section className="space-y-8 rounded-4xl bg-gradient-to-br from-sd-soft-blue via-white to-sd-soft-pink p-8 shadow-surface-md">
      <div className="space-y-3">
        <h2 className="font-heading text-3xl font-semibold text-sd-navy">
          How we&apos;re building it (together)
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className="relative rounded-3xl border border-sd-navy/10 bg-white/80 p-6 shadow-surface-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sd-navy text-lg font-semibold text-white">
              {step.number}
            </div>
            <h3 className="mb-2 font-heading text-xl font-semibold text-sd-navy">
              {step.title}
            </h3>
            <p className="text-sm leading-6 text-sd-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

