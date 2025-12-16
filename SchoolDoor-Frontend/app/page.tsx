import { BlogTeaser } from "@/components/BlogTeaser";
import { BuildingTogether } from "@/components/BuildingTogether";
import { ExpertCommunity } from "@/components/ExpertCommunity";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { Hero } from "@/components/Hero";
import { SearchPreview } from "@/components/SearchPreview";
import { SectionOne } from "@/components/sections/SectionOne";
import { SectionTwo } from "@/components/sections/SectionTwo";
import { SectionThree } from "@/components/sections/SectionThree";
import { SectionFour } from "@/components/sections/SectionFour";
import { SectionFive } from "@/components/sections/SectionFive";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <SectionOne />
      <SectionTwo />
      <SectionThree />
      <SectionFour />
      <SectionFive />

      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[460px] bg-confetti-pattern blur-3xl" />


    </main>
  );
}
