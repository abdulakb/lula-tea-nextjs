"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useState, useEffect } from "react";
import CheckoutProgress from "../components/CheckoutProgress";
import { CartItemSkeleton } from "../components/SkeletonLoaders";
import { motion, PanInfo } from "framer-motion";

interface CartItemRowProps {
  item: {
    id: string;
    name: string;
    nameAr: string;
    price: number;
    quantity: number;
    image: string;
  };
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  availableStock: number;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  language: string;
  t: (key: string) => string;
}

function CartItemRow({ 
  item, 
  removeItem, 
  updateQuantity, 
  availableStock, 
  showToast, 
  language, 
  t 
}: CartItemRowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    // If dragged more than 100px to the left, remove item
    if (info.offset.x < -100) {
      removeItem(item.id);
      showToast(
        language === "ar" ? "تم إزالة المنتج من السلة" : "Item removed from cart",
        "info"
      );
    }
    setDragX(0);
  };

  return (
    <motion.div
      key={item.id}
      drag="x"
      dragConstraints={{ left: -150, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onDrag={(event, info) => setDragX(info.offset.x)}
      className="relative flex items-center gap-6 py-6 border-b border-tea-brown/10 last:border-0"
      style={{ touchAction: "pan-y" }}
    >
      {/* Delete Background Indicator (shown when dragging left) */}
      <div 
        className="absolute right-0 top-0 bottom-0 flex items-center justify-end px-6 text-white font-semibold transition-all"
        style={{
          background: "linear-gradient(to left, #ef4444, #dc2626)",
          width: `${Math.abs(dragX)}px`,
          opacity: Math.min(Math.abs(dragX) / 100, 1),
        }}
      >
        {Math.abs(dragX) > 50 && (
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>{language === "ar" ? "احذف" : "Delete"}</span>
          </div>
        )}
      </div>

      {/* Item Content */}
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
          onClick={() => {
            updateQuantity(item.id, item.quantity - 1);
            if (item.quantity > 1) {
              showToast(
                language === "ar" ? "تم تحديث الكمية" : "Quantity updated",
                "info"
              );
            }
          }}
          className="w-8 h-8 rounded-full bg-tea-green/20 hover:bg-tea-green/30 text-deep-brown font-bold transition-colors"
        >
          -
        </button>
        <span className="text-lg font-semibold text-deep-brown w-8 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => {
            if (item.quantity >= availableStock) {
              showToast(
                language === "ar" 
                  ? `الكمية المتاحة فقط ${availableStock}` 
                  : `Only ${availableStock} available`,
                "warning"
              );
              return;
            }
            updateQuantity(item.id, item.quantity + 1);
            showToast(
              language === "ar" ? "تم تحديث الكمية" : "Quantity updated",
              "info"
            );
          }}
          disabled={item.quantity >= availableStock}
          className="w-8 h-8 rounded-full bg-tea-green/20 hover:bg-tea-green/30 text-deep-brown font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={item.quantity >= availableStock ? `Only ${availableStock} in stock` : ''}
        >
          +
        </button>
      </div>

      {/* Stock Warning */}
      {item.quantity >= availableStock && (
        <div className="text-xs text-amber-600 font-medium">
          {language === "ar" ? `المخزون: ${availableStock}` : `Stock: ${availableStock}`}
        </div>
      )}

      {/* Desktop Delete Button (hidden on mobile) */}
      <button
        onClick={() => {
          removeItem(item.id);
          showToast(
            language === "ar" ? "تم إزالة المنتج من السلة" : "Item removed from cart",
            "info"
          );
        }}
        className="hidden md:block text-red-600 hover:text-red-700 transition-colors p-2"
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

      {/* Mobile Swipe Hint (shown briefly on first render) */}
      {!isDragging && (
        <div className="md:hidden absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 pointer-events-none">
          ← {language === "ar" ? "اسحب لليسار للحذف" : "Swipe left to delete"}
        </div>
      )}
    </motion.div>
  );
}

export default function CartPage() {
  const { t, language } = useLanguage();
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { showToast } = useToast();
  const [availableStock, setAvailableStock] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch current stock
  useEffect(() => {
    async function fetchStock() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        const product = data.find((p: any) => p.sku === 'LULA-TEA-001');
        setAvailableStock(product?.stock || 0);
      } catch (error) {
        console.error('Error fetching stock:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStock();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-12 text-center">
            {t("cartTitle")}
          </h1>
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
        </div>
      </main>
    );
  }

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
        <CheckoutProgress currentStep={1} />
        <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-12 text-center">
          {t("cartTitle")}
        </h1>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              removeItem={removeItem}
              updateQuantity={updateQuantity}
              availableStock={availableStock}
              showToast={showToast}
              language={language}
              t={t}
            />
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
