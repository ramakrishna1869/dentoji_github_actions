import React from "react";
import { motion } from "framer-motion";

import floatingImage1 from "../../../../../assets/Dentoji/dentalx/proforma.png";
import floatingImage2 from "../../../../../assets/Dentoji/dentalx/proforma2.png";
import grid from "../../../../../assets/Dentoji/home/grid.png";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

export default function DentojiLogin() {

  return (
    <section id="track">
    <motion.div
      className="relative w-full px-6 md:px-20 py-20 overflow-hidden bg-gray-50"
      style={{
        background: `url(${grid})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="min-h-[400px] grid lg:grid-cols-2 gap-8 items-start relative z-10">
        {/* Left Content */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="max-w-xl flex flex-col justify-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#2D1B69] mb-8 leading-tight">
            Track Every Tooth with Precision
          </h1>
          <p className="text-2xl text-[#2D1B69] mb-4 leading-relaxed font-semibold">
            Create detailed treatment cost estimates your patients can trust.
          </p>
          <p className="text-2xl text-[#2D1B69] mb-8 leading-relaxed font-semibold">
            Easily mark diagnoses, add treatment notes, and track before–after progress. The Teeth Set screen gives you a clear view of your patient's dental health, tooth by tooth.
          </p>
        
        </motion.div>

        {/* Right Content with Referral Dashboard Images */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="w-full h-full flex flex-col justify-center items-end relative min-h-[400px]"
        >
          {/* Large Dashboard Image - Positioned Higher */}
          <motion.div
            className="relative z-10 mt-[-175px] mr-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <img
              src={floatingImage2}
              alt="Large Dashboard"
              className="w-[500px] h-auto object-contain rounded-lg"
            />
          </motion.div>

          {/* Small Dashboard Image - Bottom Left with Float */}
          <motion.div
            className="absolute bottom-[-20px] left-[-20px] z-20"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            <img
              src={floatingImage1}
              alt="Small Floating Dashboard"
              className="w-74 h-auto object-contain shadow-lg rounded-lg "
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
    </section>
  );
}
