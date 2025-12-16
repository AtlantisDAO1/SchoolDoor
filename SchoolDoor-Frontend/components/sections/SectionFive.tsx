import Link from "next/link";
import { Github } from "lucide-react";

export const SectionFive = () => {
    return (
        <section className="relative py-20 px-6 md:px-12 lg:px-24 bg-sd-soft-pink overflow-hidden">
            <div className="relative z-10 max-w-5xl mx-auto text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-sm font-medium text-sd-navy mb-8 shadow-sm border border-sd-navy/5">
                    <Github className="w-4 h-4" />
                    <span>Open Source Initiative</span>
                </div>

                {/* Heading */}
                <h2 className="text-4xl font-times md:text-5xl lg:text-[2.625rem] text-sd-navy mb-6">
                    Transparent by Design
                </h2>

                {/* Description */}
                <p className="text-lg md:text-xl text-sd-ink/80 mb-10 max-w-2xl mx-auto leading-relaxed font-sans">
                    SchoolDoor is built in the open. We believe that trust comes from transparency.
                    Explore our code, contribute to the roadmap, or build your own tools on top of our data.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {/* Primary Button: Dark Navy Background, White Text (High Contrast) */}
                    <Link
                        href="https://github.com/AtlantisDAO1/SchoolDoor"
                        target="_blank"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1F2937] text-white rounded-[10px] font-medium hover:bg-black transition-all hover:-translate-y-0.5 shadow-lg"
                    >
                        <Github className="w-5 h-5 fill-white" />
                        Star on GitHub
                    </Link>

                    {/* Secondary Button: White Background, Dark Border */}
                    <Link
                        href="https://github.com/AtlantisDAO1/SchoolDoor/blob/main/CONTRIBUTING.md"
                        target="_blank"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-sd-navy rounded-[10px] font-medium hover:bg-gray-50 transition-all border border-gray-200 hover:border-gray-300 hover:-translate-y-0.5 shadow-sm"
                    >
                        How to Contribute
                    </Link>
                </div>
            </div>
        </section>
    );
};
