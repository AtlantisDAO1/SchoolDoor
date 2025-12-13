import Link from "next/link";

export const SectionOne = () => {
    return (
        <section className="min-h-screen relativ flex items-center bg-white px-6 md:px-12 lg:px-24">
                <div className="absolute top-16 left-[20%] z-20 transform -rotate-12">
                            <img 
                                src="/images/sectionOne/pencil.png" 
                                alt="Pencil illustration" 
                                className="w-16 h-16 md:w-52 md:h-21 object-contain"
                            />
                        </div>
            <div className="max-w-7xl  mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8 text-center lg:text-left">
                    <div className="space-y-">
                        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-black leading-tight font-times">
                            Find the right
                            <br />
                            <span className="text-black">school & teachers</span>
                        </h1>
                        
                        <p className="text-lg  md:text-base text-black leading-relaxed max-w-lg mx-auto lg:mx-0">
                            A citizen-led movement where parents, teachers, 
                            and schools co-create a transparent, trusted 
                            guide to education in India.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row gap-4 justify-center lg:justify-start">
                        <Link
                            href="/reviews"
                            className="inline-flex items-center justify-center px-4 py-[.625rem] bg-[#62C8B2] hover:bg-[#4FB39F] text-white rounded-[.625rem] transition-colors duration-200 text-sm md:text-base"
                        >
                            Review Schools
                            <span className="ml-2 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">
<path d="M11.4998 20.7C6.42692 20.7 2.2998 16.5729 2.2998 11.5C2.2998 6.42711 6.42692 2.29999 11.4998 2.29999C16.5727 2.29999 20.6998 6.42711 20.6998 11.5C20.6998 16.5729 16.5727 20.7 11.4998 20.7ZM11.4998 3.35983C7.01124 3.35983 3.35964 7.01154 3.35964 11.5C3.35964 15.9884 7.01124 19.6401 11.4998 19.6401C15.9884 19.6401 19.64 15.9884 19.64 11.5C19.64 7.01154 15.9884 3.35983 11.4998 3.35983Z" fill="black"/>
<path d="M11.5089 16.5883C9.68246 16.5883 8.01692 15.6603 7.05368 14.106C6.93523 13.9149 6.82925 13.7163 6.73639 13.5115C6.68162 13.3839 6.67904 13.24 6.7292 13.1107C6.77936 12.9813 6.87827 12.8767 7.00468 12.8194C7.13109 12.7622 7.27491 12.7568 7.40526 12.8044C7.53561 12.852 7.64208 12.9488 7.70182 13.0741C7.77583 13.2372 7.86026 13.3953 7.95459 13.5476C8.72313 14.7881 10.0517 15.5286 11.5088 15.5286C12.9524 15.5286 14.2746 14.7984 15.0458 13.5754C15.1403 13.4254 15.2252 13.2696 15.2999 13.1088C15.3603 12.9832 15.4677 12.8865 15.5989 12.8395C15.7302 12.7925 15.8746 12.7991 16.001 12.8579C16.1274 12.9167 16.2256 13.0229 16.2742 13.1535C16.3229 13.2841 16.3182 13.4286 16.261 13.5557C16.1673 13.7572 16.0609 13.9526 15.9425 14.1407C14.9759 15.6733 13.3185 16.5883 11.5089 16.5883Z" fill="black"/>
<path d="M15.783 9.7024C15.783 9.82806 15.7582 9.95249 15.7101 10.0686C15.662 10.1847 15.5916 10.2902 15.5027 10.379C15.4138 10.4679 15.3083 10.5384 15.1923 10.5865C15.0762 10.6346 14.9517 10.6593 14.8261 10.6593C14.7004 10.6593 14.576 10.6346 14.4599 10.5865C14.3438 10.5384 14.2383 10.4679 14.1494 10.379C14.0606 10.2902 13.9901 10.1847 13.942 10.0686C13.8939 9.95249 13.8691 9.82806 13.8691 9.7024C13.8691 9.44861 13.97 9.20521 14.1494 9.02576C14.3289 8.8463 14.5723 8.74548 14.8261 8.74548C15.0798 8.74548 15.3232 8.8463 15.5027 9.02576C15.6822 9.20521 15.783 9.44861 15.783 9.7024Z" fill="black"/>
<path d="M9.13063 9.7024C9.13063 9.95619 9.02981 10.1996 8.85035 10.379C8.6709 10.5585 8.4275 10.6593 8.17371 10.6593C7.91992 10.6593 7.67653 10.5585 7.49707 10.379C7.31761 10.1996 7.2168 9.95619 7.2168 9.7024C7.2168 9.44861 7.31761 9.20521 7.49707 9.02576C7.67653 8.8463 7.91992 8.74548 8.17371 8.74548C8.4275 8.74548 8.6709 8.8463 8.85035 9.02576C9.02981 9.20521 9.13063 9.44861 9.13063 9.7024Z" fill="black"/>
</svg>
                            </span>
                        </Link>
                        
                        <Link
                        target="_blank"
                            href="https://tally.so/r/wapg7E"
                            className="inline-flex items-center justify-center px-4 hover:border-gray-400 text-[#0B6C57] rounded-full transition-colors duration-200 text-sm md:text-base"
                        >
                            Join Early Circle
                        </Link>
                    </div>
                </div>

                {/* Right Illustration */}
                <div className="relative flex items-center justify-center lg:justify-end">
                    <div className="relative w-full max-w-lg">
                        {/* Background Circle */}

                        
                        {/* Main Apple Image */}
                        <div className="relative z-10 flex items-center justify-center">
                            <img 
                                src="/images/sectionOne/aForApple.png" 
                                alt="A for Apple - Educational illustration" 
                                className="w-80 h-80 md:w-96 md:h-96 object-contain"
                            />
                        </div>

                        {/* Pencil Image - Positioned as floating element */}
                    

                    </div>
                </div>
            </div>
        </section>
    );
};
