export const SectionTwo = () => {
    const features = [
        {
            image: "/images/sectionTwo/sectiontwofirst.png",
            title: "Too Many Choices,",
            subtitle: "too little clarity",
            description: "Over 1.5 Million Schools! Rankings rarely tell the full story"
        },
        {
            image: "/images/sectionTwo/sectiontwosecond.png",
            title: "Real Experience",
            subtitle: "Matters",
            description: "Honest feedback from parents and students beats glossy brochures"
        },
        {
            image: "/images/sectionTwo/sectiontwothird.png",
            title: "Shared",
            subtitle: "Responsibility",
            description: "When families and educators build the record together, everyone wins."
        }
    ];

    return (
        <section className="min-h-screen flex items-center justify-center bg-white px-6 md:px-12 lg:px-24 py-16">
            <div className="max-w-7xl mx-auto w-full">
                {/* Section Title */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-times md:text-5xl lg:text-[2.625rem]  text-black ">
                        Why SchoolDoor?
                    </h2>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center ">
                            {/* Feature Image */}
                            <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 flex items-center justify-center">
                                <img 
                                    src={feature.image} 
                                    alt={`${feature.title} ${feature.subtitle}`}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Feature Content */}
                            <div className="space-y-3 max-w-[280px]">
                                <div className="space-y-0">
                                    <h3 className="text-xl md:text-[1.625rem] font-normal text-black leading-tight">
                                        {feature.title}
                                    </h3>
                                    <h4 className="text-xl md:text-[1.625rem] font-normal text-black leading-tight">
                                        {feature.subtitle}
                                    </h4>
                                </div>
                                
                                <p className="text-sm md:text-base text-black leading-relaxed max-w-[200px]">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
