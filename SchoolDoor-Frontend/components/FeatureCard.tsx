import type { ReactNode } from "react";

export type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-sd-navy/10 bg-white/85 p-6 shadow-surface-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-surface-md">
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sd-soft-blue text-sd-navy transition group-hover:bg-sd-soft-pink group-hover:text-sd-salmon">
        {icon}
      </div>
      <h3 className="font-heading text-lg font-semibold text-sd-ink">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-sd-muted">{description}</p>
    </article>
  );
}
