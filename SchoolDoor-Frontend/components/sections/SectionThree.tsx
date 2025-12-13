export const SectionThree = () => {
    return (
        <section 
            className="relative min-h-screen py-16 px-6 md:px-12 lg:px-24"
            style={{
                backgroundImage: "url('/images/sectionThree/sectionthreebackground.png')",
                backgroundColor: "white",
                backgroundSize: "100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}
        >
            
            <div className="relative z-10  max-w-7xl mx-auto w-full">
                {/* Section Title */}
                <div className="text-center mb-12 pt-8">
                    <h2 className="text-4xl font-times md:text-5xl lg:text-[2.625rem] text-black mb-4">
                        How we're building it (together)
                    </h2>
                </div>

                {/* Steps Container - Mobile: Grid Layout, Desktop: Diagonal Layout */}
                <div className="block md:hidden">
                    {/* Mobile Grid Layout (like SectionTwo) */}
                    <div className="grid grid-cols-1 gap-8">
                        {/* Step 1: Listen */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-48 h-48 flex items-center justify-center">
                                <img 
                                    src="/images/sectionThree/sectionthreefirst.png" 
                                    alt="Listen - Collect stories from families and educators"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="space-y-3 max-w-[280px]">
                                <h3 className="text-xl font-normal text-black">
                                    Listen
                                </h3>
                                <p className="text-sm text-black leading-relaxed">
                                    Collect stories, concerns, and wish-lists from families and educators.
                                </p>
                            </div>
                        </div>

                        {/* Step 2: Co-design */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-48 h-48 flex items-center justify-center">
                                <img 
                                    src="/images/sectionThree/sectionthreesecond.png" 
                                    alt="Co-design - Sketch SchoolDoor based on feedback"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="space-y-3 max-w-[280px]">
                                <h3 className="text-xl font-normal text-black">
                                    Co-design
                                </h3>
                                <p className="text-sm text-black leading-relaxed">
                                    Sketch Version 1.0 of SchoolDoor based on what you say.
                                </p>
                            </div>
                        </div>

                        {/* Step 3: Launch & Iterate */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-48 h-48 flex items-center justify-center">
                                <img 
                                    src="/images/sectionThree/sectionthreethird.png" 
                                    alt="Launch & Iterate - Community-moderated directory"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="space-y-3 max-w-[280px]">
                                <h3 className="text-xl font-normal text-black">
                                    Launch & Iterate
                                </h3>
                                <p className="text-sm text-black leading-relaxed">
                                    Release the first community-moderated directory; refine it as more voices join.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Diagonal Layout */}
                <div className="hidden md:block relative min-h-160">
                    {/* Box 1: Listen - Top Left */}
                    <div className="absolute top-0 left-4 md:left-12 lg:left-20 w-[20rem] md:w-[24rem]">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <img 
                                src="/images/sectionThree/sectionthreefirst.png" 
                                alt="Listen - Collect stories from families and educators"
                                className="object-contain"
                                style={{ width: '21.875rem', height: '10.125rem' }}
                            />
                            <div className="space-y-2 -mt-6">
                                <h3 className="text-xl md:text-[1.625rem] font-normal text-black">
                                    Listen
                                </h3>
                                <div className="text-sm md:text-base text-black leading-relaxed">
                                    <div>Collect stories, concerns,</div>
                                    <div>and wish-lists from</div>
                                    <div>families and educators.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Box 2: Co-design - Center (starts at middle of Box 1) */}
                    <div className="absolute  top-20 left-1/2 transform -translate-x-1/2 w-[24rem] md:w-md">
                        <div className="flex flex-col items-center text-center  ">
                            <img 
                                src="/images/sectionThree/sectionthreesecond.png" 
                                alt="Co-design - Sketch SchoolDoor based on feedback"
                                className="object-contain"
                                style={{ width: '24rem', height: '18rem' }}
                            />
                            <div className="space-y-2 -mt-20">
                                <h3 className="text-xl md:text-[1.625rem] font-normal text-black">
                                    Co-design
                                </h3>
                                <div className="text-sm md:text-base text-black leading-relaxed">
                                    <div>Sketch Version 1.0 of</div>
                                    <div>SchoolDoor based on</div>
                                    <div>what you say.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Box 3: Launch & Iterate - Bottom Right (starts at middle of Box 2) */}
                    <div className="absolute top-56  right-4 md:right-12 lg:right-20 w-[20rem] md:w-[24rem]">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <img 
                                src="/images/sectionThree/sectionthreethird.png" 
                                alt="Launch & Iterate - Community-moderated directory"
                                className="object-contain"
                                style={{ width: '18rem', height: '13.375rem' }}
                            />
                            <div className="space-y-2 -mt-4">
                                <h3 className="text-xl md:text-[1.625rem] font-normal text-black">
                                    Launch & Iterate
                                </h3>
                                <div className="text-sm md:text-base text-black leading-relaxed">
                                    <div>Release the first</div>
                                    <div>community-moderated directory;</div>
                                    <div>refine it as more voices join.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
