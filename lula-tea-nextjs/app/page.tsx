"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const [quantity, setQuantity] = useState(1);
  const { t } = useLanguage();

  const handleWhatsAppOrder = () => {
    const message = `${t('orderNow')} - ${quantity} x ${t('productName')}`;
    const whatsappUrl = `https://wa.me/966539666654?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tea-green/20 via-warm-cream to-soft-sage/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-bold text-deep-brown mb-6 leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-xl md:text-2xl text-tea-brown mb-8">
                {t('heroSubtitle')}
              </p>
              <p className="text-lg text-deep-brown/80 mb-8 max-w-xl">
                {t('heroDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="#product"
                  className="bg-tea-green hover:bg-tea-green/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  {t('orderNow')}
                </a>
                <Link 
                  href="/contact"
                  className="bg-white hover:bg-warm-cream text-tea-brown px-8 py-4 rounded-full text-lg font-semibold transition-all border-2 border-tea-brown/20"
                >
                  {t('contactUs')}
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/logo.jpg"
                alt="Lula Tea Premium Blend"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-deep-brown mb-4">
              {t('productTitle')}
            </h2>
            <p className="text-xl text-tea-brown">
              {t('productSubtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-warm-cream rounded-3xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Product Image */}
              <div className="relative h-80 md:h-auto">
                <Image
                  src="/images/product.jpg"
                  alt="Lula Tea Premium Blend"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-deep-brown mb-4">
                  {t('productName')}
                </h3>
                <p className="text-tea-brown mb-6">
                  {t('productDescription')}
                </p>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-deep-brown">{t('feature1')}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-deep-brown">{t('feature2')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-deep-brown">{t('feature3')}</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-deep-brown mb-2">
                    {t('quantity')}
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-tea-green/20 hover:bg-tea-green/30 text-deep-brown font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="text-2xl font-semibold text-deep-brown w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-tea-green/20 hover:bg-tea-green/30 text-deep-brown font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full bg-tea-green hover:bg-tea-green/90 text-white px-6 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    {t('addToCart')}
                  </button>
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-[#25D366] hover:bg-[#22c55e] text-white px-6 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    {t('orderViaWhatsApp')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-soft-sage/20 to-warm-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-deep-brown mb-4">
              {t('aboutTitle')}
            </h2>
            <p className="text-xl text-tea-brown max-w-3xl mx-auto">
              {t('aboutSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quality */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-tea-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-tea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-deep-brown mb-3">{t('qualityTitle')}</h3>
              <p className="text-tea-brown">
                {t('qualityDescription')}
              </p>
            </div>

            {/* Love */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-deep-brown mb-3">{t('loveTitle')}</h3>
              <p className="text-tea-brown">
                {t('loveDescription')}
              </p>
            </div>

            {/* Unique */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-tea-brown/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-tea-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-deep-brown mb-3">{t('uniqueTitle')}</h3>
              <p className="text-tea-brown">
                {t('uniqueDescription')}
              </p>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-16 text-center bg-white rounded-2xl p-12 shadow-lg">
            <h3 className="text-3xl font-bold text-deep-brown mb-4">
              {t('comingSoonTitle')}
            </h3>
            <p className="text-xl text-tea-brown mb-6">
              {t('comingSoonDescription')}
            </p>
            <p className="text-lg text-deep-brown/70">
              {t('comingSoonSubtext')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tea-green text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl mb-8 text-white/90">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#product"
              className="bg-white hover:bg-warm-cream text-tea-green px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              {t('shopNow')}
            </a>
            <Link 
              href="/contact"
              className="bg-tea-brown hover:bg-deep-brown text-white px-8 py-4 rounded-full text-lg font-semibold transition-all"
            >
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
