"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-44 md:bottom-32 left-6 z-50 bg-tea-green hover:bg-tea-green/90 text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-16 opacity-0 pointer-events-none"
      } hover:scale-110 group`}
      aria-label={language === "ar" ? "العودة للأعلى" : "Back to top"}
    >
      {/* Arrow icon */}
      <svg
        className="w-6 h-6 transition-transform group-hover:-translate-y-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>

      {/* Tooltip */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-deep-brown text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {language === "ar" ? "العودة للأعلى" : "Back to top"}
        {/* Arrow */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-deep-brown"></div>
      </div>
    </button>
  );
}
