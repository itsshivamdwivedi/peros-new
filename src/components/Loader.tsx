"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [isExiting, setIsExiting] = useState(false);
  const text = "Survival of Fittest";
  const words = text.split(" "); // Split text into words

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2200); // Matches text animation duration
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-1000 ease-in-out"
      style={{
        clipPath: isExiting ? "inset(0 0 100% 0)" : "inset(0 0 0 0)", // Curtain effect
      }}
    >
      <div className="inline-flex flex-wrap justify-center gap-2">
        {words.map((word, index) => (
          <span
            key={index}
            className="text-white text-2xl md:text-4xl font-semibold animate-word"
            style={{ animationDelay: `${index * 0.5}s` }} // Delay for each word
          >
            {word}
          </span>
        ))}
      </div>
      
      <style jsx global>{`
        @keyframes fadeInWord {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-word {
          opacity: 0; /* Start hidden */
          transform: translateY(20px); /* Start position */
          animation: fadeInWord 0.5s forwards; /* Apply animation */
        }
      `}</style>
    </div>
  );
}