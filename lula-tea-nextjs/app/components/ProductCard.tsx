"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useToast } from "@/context/ToastContext";
import { ProductCardSkeleton } from "./SkeletonLoaders";
import StockNotificationForm from "./StockNotificationForm";

interface Product {
  id: string;
  sku: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  stock: number;
  available: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
  imageUrl?: string;
}

interface ProductCardProps {
  showActions?: boolean;
}

export default function ProductCard({ showActions = true }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const { trackEvent } = useAnalytics();
  const { showToast } = useToast();

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      // Get the first product (LULA-TEA-001)
      if (data.products && data.products.length > 0) {
        setProduct(data.products[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProductCardSkeleton />;
  }

  if (!product) {
    return (
      <div className="bg-warm-cream rounded-3xl shadow-xl overflow-hidden p-12 text-center">
        <p className="text-tea-brown">{language === "ar" ? "المنتج غير متوفر" : "Product not available"}</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.isOutOfStock) {
      showToast(language === "ar" ? "نفذت الكمية" : "Out of stock", "error");
      return;
    }

    if (quantity > product.stock) {
      showToast(
        language === "ar" 
          ? `الكمية المتاحة فقط ${product.stock}` 
          : `Only ${product.stock} available`,
        "warning"
      );
      return;
    }

    addItem(
      {
        id: product.id,
        name: product.name,
        nameAr: product.nameAr,
        price: product.price,
        image: product.imageUrl || "/images/Product Image2.jpg",
      },
      quantity
    );
    
    // Track add to cart event
    trackEvent("add_to_cart", {
      product_id: product.id,
      product_name: product.name,
      quantity,
      price: product.price,
      total_value: product.price * quantity,
    });
    
    // Show toast notification
    showToast(
      language === "ar" 
        ? `تمت إضافة ${quantity} إلى السلة! 🛒` 
        : `${quantity} item${quantity > 1 ? 's' : ''} added to cart! 🛒`,
      "success"
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  const handleOrderViaWhatsApp = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  return (
    <div className="bg-warm-cream rounded-3xl shadow-xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Product Image */}
        <div className="relative h-80 md:h-auto">
          <Image
            src={product.imageUrl || "/images/Product Image2.jpg"}
            alt={language === "ar" ? product.nameAr : product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          {/* Stock Badge */}
          {product.isOutOfStock && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg animate-pulse">
              {language === "ar" ? "نفذت الكمية" : "Out of Stock"}
            </div>
          )}
          {product.isLowStock && !product.isOutOfStock && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{language === "ar" ? `${product.stock} متبقي فقط! ⚡` : `Only ${product.stock} left! ⚡`}</span>
              </div>
            </div>
          )}
          {product.stock > 10 && product.stock <= 20 && !product.isLowStock && !product.isOutOfStock && (
            <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-lg font-semibold shadow-lg text-sm">
              {language === "ar" ? `${product.stock} متوفر` : `${product.stock} in stock`}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h3 className="text-3xl font-bold text-deep-brown mb-4">
            {language === "ar" ? product.nameAr : product.name}
          </h3>
          <p className="text-tea-brown mb-6">
            {language === "ar" ? product.descriptionAr : product.description}
          </p>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-deep-brown">{t("feature1")}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-deep-brown">{t("feature2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-deep-brown">{t("feature3")}</span>
            </div>
          </div>

          {/* Stock Notification Form - Show when out of stock */}
          {product.isOutOfStock && showActions && (
            <div className="mb-6">
              <StockNotificationForm 
                productId={product.id}
                productName={language === "ar" ? product.nameAr : product.name}
              />
            </div>
          )}

          <div className="mb-6">
            <div className="text-3xl font-bold text-deep-brown mb-1">
              {language === "ar" 
                ? `${(product.price * quantity).toFixed(0)} ريال` 
                : `${(product.price * quantity).toFixed(0)} SAR`}
            </div>
            <p className="text-sm text-tea-brown/70">
              {language === "ar" 
                ? `${product.price} ريال للكيس • ٢٠٠ جرام`
                : `${product.price} SAR per pack • 200g per pack`}
            </p>
          </div>

          {showActions && (
            <>
              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-deep-brown mb-2">
                  {t("quantity")}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.isOutOfStock}
                    className="w-10 h-10 rounded-full bg-tea-green/20 hover:bg-tea-green/30 text-deep-brown font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-2xl font-semibold text-deep-brown w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={product.isOutOfStock || quantity >= product.stock}
                    className="w-10 h-10 rounded-full bg-tea-green/20 hover:bg-tea-green/30 text-deep-brown font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  {product.stock > 0 && product.stock < 20 && (
                    <span className="text-xs text-orange-600 font-semibold ml-2">
                      {language === "ar" ? `(${product.stock} متوفر)` : `(${product.stock} available)`}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.isOutOfStock}
                  className="w-full bg-tea-green hover:bg-tea-green/90 text-white px-6 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.isOutOfStock 
                    ? (language === "ar" ? "نفذت الكمية" : "Out of Stock")
                    : t("addToCart")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
