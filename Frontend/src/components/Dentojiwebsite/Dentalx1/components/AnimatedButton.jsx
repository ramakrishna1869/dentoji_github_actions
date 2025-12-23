import React from "react";

const AnimatedButton = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`btn-marquee  relative rounded-full bg-[#5B4ECC] hover:bg-[#4A3DB3] text-white font-bold cursor-pointer transition-colors duration-300 shadow-lg hover:shadow-xl border-2 border-transparent overflow-hidden ${className}`}
      style={{
        padding: "1.6rem 8rem ",
        WebkitMaskImage: "-webkit-radial-gradient(black, white)",
      }}
    >
      {/* Static text - fades out on hover */}
      <span className="text-span">
        {children}
      </span>

      {/* Marquee text - animates on hover */}
      <span className="marquee-span" aria-hidden="true">
        {children}
      </span>

      <style jsx>{`
        .btn-marquee span {
          display: grid;
          inset: 0;
          place-items: center;
          position: absolute;
          transition: opacity 0.2s ease;
        }

        .marquee-span {
          --spacing: 9em;
          --start: 0em;
          --end: 9em;
          animation: marquee 1s linear infinite;
          animation-play-state: paused;
          opacity: 0;
          position: relative;
          text-shadow: white var(--spacing) 0, white calc(var(--spacing) * -1) 0,
            white calc(var(--spacing) * -2) 0;
        }

        .btn-marquee:hover .marquee-span {
          animation-play-state: running;
          opacity: 1;
        }

        .btn-marquee:hover .text-span {
          opacity: 0;
        }

        @keyframes marquee {
          0% {
            transform: translateX(var(--start));
          }
          100% {
            transform: translateX(var(--end));
          }
        }
      `}</style>
    </button>
  );
};

export default AnimatedButton; 