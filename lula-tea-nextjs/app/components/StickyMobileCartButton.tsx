"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

interface StickyMobileCartButtonProps {
  onAddToCart: () => void;
  price: number;
  isOutOfStock?: boolean;
  scrollThreshold?: number;
}

const StickyMobileCartButton: React.FC<StickyMobileCartButtonProps> = ({
  onAddToCart,
  price,
  isOutOfStock = false,
  scrollThreshold = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="md:hidden fixed bottom-20 left-0 right-0 z-40 px-4"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-full font-bold text-lg shadow-2xl transition-all ${
              isOutOfStock
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] hover:shadow-3xl text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} />
              <span>
                {isOutOfStock
                  ? language === "ar"
                    ? "نفذت الكمية"
                    : "Out of Stock"
                  : language === "ar"
                  ? "أضف للسلة"
                  : "Add to Cart"}
              </span>
            </div>
            {!isOutOfStock && (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="font-bold text-xl"
              >
                {language === "ar" ? `${price} ر.س` : `${price} SAR`}
              </motion.span>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyMobileCartButton;
