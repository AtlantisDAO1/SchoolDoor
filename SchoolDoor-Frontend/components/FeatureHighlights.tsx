import Image from "next/image";
import { FeatureCard } from "./FeatureCard";

const FEATURES = [
  {
    title: "Too Many Choices, too little clarity",
    description: "Over 1.5 Million Schools! Rankings rarely tell the full story",
    icon: <Image src="/file.svg" alt="" width={24} height={24} />,
  },
  {
    title: "Real Experience Matters",
    description:
      "Honest feedback from parents and students beats glossy brochures",
    icon: (
      <span className="relative inline-flex h-6 w-6 items-center justify-center before:absolute before:-inset-1 before:rounded-full before:bg-sd-soft-pink before:opacity-70">
        <span className="relative text-base text-sd-salmon">❤</span>
      </span>
    ),
  },
  {
    title: "Shared Responsibility",
    description:
      "When families and educators build the record together, everyone wins",
    icon: <Image src="/window.svg" alt="" width={24} height={24} />,
  },
];

export function FeatureHighlights() {
  return (
    <section className="space-y-6 rounded-4xl bg-white/75 p-8 shadow-surface-md backdrop-blur">
      <div className="space-y-3">
        <h2 className="font-heading text-3xl font-semibold text-sd-navy">
          Why SchoolDoor?
        </h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
