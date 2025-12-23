



// import React from "react";
// import { motion } from "framer-motion";
// import loginImg from "../../assets/Dentalx/signup.png";
// // Replace these with your actual image imports
// import floatingImage1 from "../../assets/Dentalx/floating-image-1.png";
// import floatingImage2 from "../../assets/Dentalx/floating-image-2.png";

// const containerVariants = {
//   hidden: { opacity: 0 },
//   show: { opacity: 1, transition: { staggerChildren: 0.2 } },
// };



// export default function DentojiLogin() {
//   return (
//     <motion.div
//       className="relative w-full px-6 md:px-20 py-20 overflow-hidden"
//       style={{
//         background: "linear-gradient(135deg, #E8E5FF 0%, #D4CFFF 50%, #C8C2FF 100%)",
//       }}
//       initial="hidden"
//       whileInView="show"
//       viewport={{ once: false, amount: 0.2 }}
//       variants={containerVariants}
//     >
//       <div className="min-h-[400px] grid lg:grid-cols-2 gap-8 items-start relative z-10">
//         {/* Left Content */}
//         <motion.div
//           initial={{ x: -40, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 100 }}
//           className="max-w-xl flex flex-col justify-center"
//         >
//           <h1 className="text-5xl md:text-6xl font-bold text-[#2D1B69] mb-8 leading-tight">
//             User Login
//           </h1>
//           <p className="text-lg text-[#2D1B69] mb-4 leading-relaxed font-medium">
//             Sign in to your Dentoji account to manage appointments, patient details, finances, and staff all in one secure place.
//           </p>
//           <p className="text-lg text-[#2D1B69] mb-8 leading-relaxed font-medium">
//             Your clinic's complete workflow is just a click away, anytime you need it.
//           </p>
//           <button
//             // onClick={() => window.location.href = "https://15dhxsp9-5173.inc1.devtunnels.ms/login"}
//             className="bg-[#6366F1] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#5B61F0] transition-all cursor-pointer shadow-lg w-fit"
//           >
//             Sign in
//           </button>
//         </motion.div>

//         {/* Right Section with Dashboard Images Layout */}
//         <motion.div
//           initial={{ x: 40, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 100 }}
//           className="w-full h-full flex flex-col justify-center items-end relative min-h-[400px] space-y-4"
//         >
//           {/* Top Dashboard Image */}
//           <motion.div
//             className="relative"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//           >
//             {/* <img
//               src={loginImg}
//               alt="Top Dashboard"
//               className="w-80 h-auto object-contain shadow-xl rounded-lg border border-white/20"
//             /> */}
//           </motion.div>

//           {/* Bottom Left Small Dashboard Image */}
//           <motion.div
//             className="relative -ml-20 -mt-8"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.4, duration: 0.5 }}
//           >
//             <img
//               src={floatingImage1}
//               alt="Small Dashboard"
//               className="w-97 h-auto object-contain shadow-lg rounded-lg border border-white/20"
//             />
//           </motion.div>

//           {/* Bottom Right Large Dashboard Image */}
//           <motion.div
//             className="relative -mt-12 mr-8"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.6, duration: 0.5 }}
//           >
//             <img
//               src={floatingImage2}
//               alt="Large Dashboard"
//               className="w-80 h-auto object-contain shadow-xl rounded-lg border border-white/20"
//             />
//           </motion.div>
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// }



import React from "react";
import { motion } from "framer-motion";

// Your referral dashboard images
import floatingImage1 from "../../../../../assets/Dentoji/dentalx/floating-image-1.png";
import floatingImage2 from "../../../../../assets/Dentoji/dentalx/floating-image-2.png";
import grid from "../../../../../assets/Dentoji/home/grid.png";
import { useNavigate } from 'react-router-dom';
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

export default function DentojiLogin() {
  const navigate = useNavigate();

  return (
    <section id="login">
    <motion.div
      className="relative w-full px-6 md:px-20 py-20 overflow-hidden"
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
            User Login
          </h1>
          <p className="text-2xl text-[#2D1B69] mb-4 leading-relaxed font-semibold">
Sign in to your Dentoji account to manage appointments, patient details, finances, and staff all in one secure place.          </p>
          <p className="text-2xl text-[#2D1B69] mb-8 leading-relaxed font-semibold">
            Your clinic's complete workflow is just a click away, anytime you need it.
          </p>
          <button
          onClick={() => navigate('/login')}
            className="bg-[#6366F1] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#5B61F0] transition-all cursor-pointer shadow-lg w-fit"
          >
            Sign in
          </button>
        </motion.div>
{/* Right Content with Referral Dashboard Images */}
<motion.div
  initial={{ x: 40, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 100 }}
  className="w-full h-full flex flex-col justify-center items-end relative min-h-[400px]" // reduced height
>
  {/* Large Dashboard Image - Positioned Higher */}
  <motion.div
    className="relative z-10 mt-[-175px] mr-8" // pulled higher
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
    className="absolute bottom-[-20px] left-[-20px]"
    animate={{
      y: [0, -6, 0], // Floating animation
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
      className="w-74 h-auto object-contain shadow-lg rounded-lg border border-white/20"
    />
  </motion.div>
</motion.div>

      </div>
    </motion.div>
    </section>
  );
}
