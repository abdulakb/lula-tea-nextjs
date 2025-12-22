"use client";

import React, { useEffect, useRef, useState } from "react";

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  className = "",
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        const sectionTop = rect.top + scrolled;
        const offset = (scrolled - sectionTop) * speed;
        setOffset(offset);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={sectionRef} className={`parallax-container ${className}`}>
      <div
        className="parallax-layer"
        style={{
          transform: `translateY(${offset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ParallaxSection;
