"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-warm-cream/95 backdrop-blur-sm border-b border-tea-brown/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo.jpg"
              alt="Lula Tea Logo"
              width={60}
              height={60}
              className="rounded-full object-cover"
              priority
            />
            <div>
              <h1 className="text-2xl font-bold text-deep-brown">Lula Tea</h1>
              <p className="text-xs text-tea-brown italic">{language === "ar" ? "محضّر بحب" : "Homemade with Love"}</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {/* Language Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm">
              <button
                onClick={() => setLanguage("en")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                  language === "en" ? "bg-tea-green text-white" : "text-deep-brown hover:bg-tea-green/10"
                }`}
                aria-label="English"
              >
                <Image src="/icons/uk.svg" alt="EN" width={20} height={20} />
                <span className="text-sm font-medium hidden sm:inline">EN</span>
              </button>
              <button
                onClick={() => setLanguage("ar")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                  language === "ar" ? "bg-tea-green text-white" : "text-deep-brown hover:bg-tea-green/10"
                }`}
                aria-label="العربية"
              >
                <Image src="/icons/sa.svg" alt="AR" width={20} height={20} />
                <span className="text-sm font-medium hidden sm:inline">AR</span>
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-deep-brown hover:text-tea-green transition-colors font-medium"
              >
                {t("home")}
              </Link>
              <Link 
                href="/product" 
                className="text-deep-brown hover:text-tea-green transition-colors font-medium"
              >
                {t("product")}
              </Link>
              <Link 
                href="/contact" 
                className="text-deep-brown hover:text-tea-green transition-colors font-medium"
              >
                {t("contactUs")}
              </Link>
              <Link 
                href="/account" 
                className="text-deep-brown hover:text-tea-green transition-colors font-medium"
              >
                {t("account")}
              </Link>
              
              {/* Cart Icon with Badge */}
              <Link 
                href="/cart"
                className="relative p-2 text-deep-brown hover:text-tea-green transition-colors"
                aria-label={t("cart")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-tea-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-deep-brown">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
