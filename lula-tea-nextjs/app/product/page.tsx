"use client";

import { useLanguage } from "@/context/LanguageContext";
import ProductCard from "../components/ProductCard";

export default function ProductPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-4">
            {t("productTitle")}
          </h1>
          <p className="text-xl text-tea-brown">{t("productSubtitle")}</p>
        </div>

        <ProductCard showActions={true} />
      </div>
    </main>
  );
}
