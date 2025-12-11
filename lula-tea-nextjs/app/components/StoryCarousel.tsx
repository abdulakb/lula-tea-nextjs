"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface StoryCarouselProps {
  language: string;
}

export default function StoryCarousel({ language }: StoryCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      image: "/images/story/slide-1.png",
      titleEn: "It started with Lula's love for exceptional tea",
      titleAr: "بدأت القصة بحب لولا للشاي الاستثنائي"
    },
    {
      image: "/images/story/slide-2.png",
      titleEn: "She carefully blended premium tea leaves",
      titleAr: "كانت تمزج أوراق الشاي الفاخرة بعناية"
    },
    {
      image: "/images/story/slide-3.png",
      titleEn: "Every blend stored in jars for daily moments and guests",
      titleAr: "كل مزيج يُحفظ في برطمان للحظات اليومية والضيوف"
    },
    {
      image: "/images/story/slide-4.png",
      titleEn: "When guests visited, they fell in love with her tea",
      titleAr: "عندما يزورها الضيوف، يقعون في حب شايها"
    },
    {
      image: "/images/story/slide-5.png",
      titleEn: "Friends kept asking: 'Can we take some home?'",
      titleAr: "الأصدقاء يسألون: 'هل يمكننا أخذ بعضه للمنزل؟'"
    },
    {
      image: "/images/story/slide-6.png",
      titleEn: "And so, Lula Tea was born",
      titleAr: "وهكذا وُلد شاي لولا"
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000); // 6 seconds per slide

      return () => clearInterval(timer);
    }
  }, [isPaused, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div 
      className="relative w-full bg-deep-brown/5 rounded-2xl overflow-hidden shadow-2xl group touch-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Full image without cropping */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={slide.image}
                alt={language === "ar" ? slide.titleAr : slide.titleEn}
                width={1920}
                height={1440}
                className="max-w-full max-h-full w-auto h-auto object-contain"
                priority={index === 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-deep-brown p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-deep-brown p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide 
                ? "bg-white w-8" 
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Pause/Play Indicator */}
      {isPaused && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          Paused
        </div>
      )}
    </div>
  );
}
