"use client";

import React, { useEffect, useState, useRef } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable custom cursor on desktop
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) return;

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    const handleMouseOut = () => setIsVisible(false);

    // Track mouse movement
    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseout", handleMouseOut);

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      "a, button, input, textarea, select, [role='button'], .cursor-pointer"
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    // Add custom-cursor class to body
    document.body.classList.add("custom-cursor");

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseout", handleMouseOut);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
      document.body.classList.remove("custom-cursor");
    };
  }, []);

  useEffect(() => {
    if (dotRef.current && outlineRef.current) {
      dotRef.current.style.transform = `translate(${position.x - 4}px, ${position.y - 4}px)`;
      outlineRef.current.style.transform = `translate(${position.x - 16}px, ${position.y - 16}px)`;
    }
  }, [position]);

  // Don't render on mobile
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot ${isVisible ? "opacity-100" : "opacity-0"} ${
          isHovering ? "scale-150" : "scale-100"
        }`}
      />
      <div
        ref={outlineRef}
        className={`cursor-outline ${isVisible ? "opacity-100" : "opacity-0"} ${
          isHovering ? "cursor-hover" : ""
        }`}
      />
    </>
  );
};

export default CustomCursor;
