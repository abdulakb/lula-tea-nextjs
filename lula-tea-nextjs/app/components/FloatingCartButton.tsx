"use client";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function FloatingCartButton() {
  const { items } = useCart();
  const { language } = useLanguage();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Don't show on cart or checkout pages
  const hideOnPages = ["/cart", "/checkout", "/order-confirmation", "/payment-success"];
  const shouldShow = !hideOnPages.includes(pathname) && totalItems > 0;

  useEffect(() => {
    setIsVisible(shouldShow);
  }, [shouldShow]);

  useEffect(() => {
    if (totalItems > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (!isVisible) return null;

  return (
    <Link
      href="/cart"
      className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 bg-tea-green hover:bg-tea-green/90 text-white rounded-full shadow-2xl p-4 transition-all duration-300 hover:scale-110 ${
        animate ? "scale-125" : "scale-100"
      }`}
      aria-label={language === "ar" ? "سلة التسوق" : "Shopping Cart"}
    >
      <div className="relative">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-accent-gold text-deep-brown text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {totalItems}
          </span>
        )}
      </div>
    </Link>
  );
}
