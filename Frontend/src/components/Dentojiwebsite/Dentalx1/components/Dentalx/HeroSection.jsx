import React from 'react';
import { ChevronRight } from 'lucide-react';

// Note: Replace this path with your actual image path
import grid from "../../../../../assets/Dentoji/dentalx/dentoji.png";
import AnimatedButton from '../AnimatedButton';
const handleStartLearning = () => {
    navigate("/contact");
};
const DentojiHeroSection = () => {
    // For demo purposes, using a placeholder. Replace with: const bgImage = grid;
    // const bgImage = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop";
    return (
        <section id="hero">
        <div
            className="relative w-full min-h-[500px] px-6 md:px-12 lg:px-20 py-16 md:py-24 overflow-hidden mt-10"
            style={{
                backgroundImage: grid ? `url(${grid})` : 'linear-gradient(135deg, #7C5BC7 0%, #9B7FD8 50%, #B59DE6 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-6 text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        Dentoji Clinic CRM Software
                    </h1>

                    <p className="text-lg md:text-xl leading-relaxed opacity-95 max-w-xl">
                        Dentoji is a smart CRM by Technoji Global that helps dental clinics manage appointments, patient records, staff, and finances. Everything stays organized, secure, and accessible
                        <br /> — all in one easy-to-use platform.
                    </p>

                    <div className="pt-5 sm:pt-3 md:pt-4 lg:pt-4">
                        <AnimatedButton onClick={() => window.open("https://calendly.com/pardhasaradhi-kommuri/30min", "_blank")}>
                            Book a Demo
                        </AnimatedButton>


                    </div>
                </div>

                {/* Right Image Placeholder - You can replace this with your actual image */}
                <div className="hidden lg:flex justify-end items-center">
                    <div className="relative w-full max-w-md">
                        {/* Image placeholder - replace with your actual image */}

                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 opacity-20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600 opacity-20 rounded-full blur-3xl" />
        </div>
    </section>
    );
};

export default DentojiHeroSection;