"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  productName: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images,
  productName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = images.length - 1;
      if (nextIndex >= images.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // If only one image, show it without carousel controls
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={images[0].src}
          alt={images[0].alt}
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Image
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Desktop) */}
        <button
          onClick={() => paginate(-1)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </button>

        {/* Image Counter (Mobile) */}
        <div className="md:hidden absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Swipe Hint (Mobile - shown briefly) */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 text-white text-xs font-medium"
        >
          ← Swipe to browse →
        </motion.div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? "w-8 h-2 bg-[var(--primary-color)] dark:bg-[var(--primary-light)]"
                : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            } rounded-full`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Thumbnail Strip (Desktop) */}
      <div className="hidden md:grid grid-cols-4 gap-2 mt-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
              index === currentIndex
                ? "ring-2 ring-[var(--primary-color)] dark:ring-[var(--primary-light)] opacity-100"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={image.src}
              alt={`${productName} thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageCarousel;
