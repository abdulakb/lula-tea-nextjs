"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { t, language } = useLanguage();
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-8">
            {t("cartTitle")}
          </h1>
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <svg
              className="w-24 h-24 mx-auto mb-6 text-tea-brown/30"
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
            <p className="text-xl text-tea-brown mb-8">{t("cartEmpty")}</p>
            <Link
              href="/product"
              className="inline-block bg-tea-green hover:bg-tea-green/90 text-white px-8 py-4 rounded-full font-semibold transition-all"
            >
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-12 text-center">
          {t("cartTitle")}
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-6 py-6 border-b border-tea-brown/10 last:border-0"
            >
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>

              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-deep-brown mb-2">
                  {language === "ar" ? item.nameAr : item.name}
                </h3>
                <p className="text-tea-brown">
                  {language === "ar" ? `${item.price} ريال` : `${item.price} SAR`}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-tea-green/20 hover:bg-tea-green/30 text-deep-brown font-bold transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-semibold text-deep-brown w-8 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-tea-green/20 hover:bg-tea-green/30 text-deep-brown font-bold transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-700 transition-colors p-2"
                aria-label={t("remove")}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Subtotal and Checkout */}
        <div className="bg-warm-cream rounded-3xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-semibold text-deep-brown">{t("subtotal")}</span>
            <span className="text-3xl font-bold text-tea-green">
              {language === "ar" ? `${subtotal} ريال` : `${subtotal} SAR`}
            </span>
          </div>
          <Link
            href="/checkout"
            className="block w-full bg-tea-green hover:bg-tea-green/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all text-center shadow-lg hover:shadow-xl"
          >
            {t("checkout")}
          </Link>
        </div>
      </div>
    </main>
  );
}
