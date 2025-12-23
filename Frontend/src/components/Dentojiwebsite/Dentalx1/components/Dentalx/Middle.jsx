import React from "react";
import { motion } from "framer-motion";
//import middle from "../../../../../assets/Dentoji/dentalx/double.png"; // replace with your actual image path
import middle from "../../../../../assets/Dentoji/dentalx/double.png";
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

export default function TeethSetHero() {
  return (
    <section id="middle">
    <motion.div
      className="relative w-full px-6 md:px-12 lg:px-20 py-12 md:py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-gray-50 to-white"
    
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="max-w-xl"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-[#1e0a4d] mb-6 leading-tight">
            Build a Perfect Smile,
            <span className="block">Tooth by Tooth</span>
          </h1>
          <p className="text-xl sm:text-xl text-[#1e0a4d] leading-relaxed font-semibold">
            The Teeth Set screen helps dentists and clinics visualize, record, and track each tooth with precision. Whether it’s treatment notes, conditions, or planned procedures, everything is organized in one place.
            </p>
        </motion.div>

        {/* Right Content - Floating Image */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative w-full h-[500px] sm:h-[400px] lg:h-[500px] flex items-center justify-center"
        >
          <motion.img
            src={middle}
            alt="Teeth Set screen"
            className="w-[100%] sm:w-[60%] lg:w-[75%] drop-shadow-2xl rounded-xl"
            animate={{ y: [0, -15, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
    </section>
  );
}
