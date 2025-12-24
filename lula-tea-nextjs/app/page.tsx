"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const [quantity, setQuantity] = useState(1);
  const { t, language } = useLanguage();
  const { addItem } = useCart();

  const handleOrderNow = () => {
    // Add item to cart first
    addItem(
      {
        id: "lula-tea-premium-200g",
        name: "Premium Loose Leaf Blend",
        nameAr: "مزيج أوراق الشاي المميز",
        price: 60,
        image: "/images/Product Image2.jpg",
      },
      quantity
    );
    // Redirect to checkout
    window.location.href = "/checkout";
  };

  return (
    <main className="min-h-screen">{/* Hero Section */}
      <section className="relative gradient-mesh py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background circles */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-tea-green/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight"
              >
                {t('heroTitle')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-4 md:mb-8"
              >
                {t('heroSubtitle')}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0"
              >
                {t('heroDescription')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.a 
                  href="#product"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="button-ripple bg-tea-green hover:bg-tea-green/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-strong hover-glow"
                >
                  {t('orderNow')}
                </motion.a>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/contact"
                    className="block bg-tea-green hover:bg-tea-green/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    {t('contactUs')}
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotate: -5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.02, rotate: 1 }}
              className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden shadow-strong hover-lift"
            >
              <Image
                src="/images/logo.jpg"
                alt="Lula Tea Premium Blend"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section id="product" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-deep-brown mb-3 md:mb-4"
            >
              {t('productTitle')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-tea-brown mb-4"
            >
              {t('productSubtitle')}
            </motion.p>
          </div>

          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-strong overflow-hidden hover-lift border border-tea-green/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Product Image */}
              <div className="relative h-80 md:h-auto">
                <Image
                  src="/images/Product Image2.jpg"
                  alt="Lula Tea Premium Blend"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('productName')}
                </h3>
                <p className="text-gray-700 dark:text-gray-200 mb-6">
                  {t('productDescription')}
                </p>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 dark:text-gray-100">{t('feature1')}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 dark:text-gray-100">{t('feature2')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 dark:text-gray-100">{t('feature3')}</span>
                  </div>
                </div>

                {/* Price with dynamic calculation */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {language === "ar" 
                      ? `${(60 * quantity)} ريال` 
                      : `${(60 * quantity)} SAR`}
                  </div>
                  <p className="text-sm text-tea-brown/70">
                    {language === "ar" 
                      ? `٦٠ ريال للكيس • ٢٠٠ جرام`
                      : `60 SAR per pack • 200g per pack`}
                  </p>
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

                {/* Order Now Button */}
                <button
                  onClick={handleOrderNow}
                  className="w-full bg-tea-green hover:bg-tea-green/90 text-white px-6 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  {t('orderNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brewing Tips Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl order-2 lg:order-1">
              <Image
                src="/images/Teapot.png"
                alt="Lula Tea Brewing"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-deep-brown mb-6">
                {language === "ar" ? "خطوات التحضير" : "How to Brew"}
              </h2>
              <p className="text-xl text-tea-brown mb-8">
                {language === "ar" 
                  ? "اتبع هذه الخطوات البسيطة للحصول على كوب الشاي المثالي"
                  : "Follow these simple steps for the perfect cup of tea"}
              </p>

              {/* Video Tutorial */}
              <div className="mb-8 bg-warm-cream/30 rounded-2xl p-6 border-2 border-tea-green/20">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-6 h-6 text-tea-green" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-deep-brown">
                    {language === "ar" ? "شاهد الفيديو التعليمي" : "Watch Tutorial Video"}
                  </h3>
                </div>
                <div className="aspect-video bg-deep-brown/5 rounded-xl relative overflow-hidden">
                  <video 
                    controls 
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    <source src="/videos/tea-brewing-tutorial.mp4" type="video/mp4" />
                    <p className="text-tea-brown text-center p-4">
                      {language === "ar" 
                        ? "متصفحك لا يدعم تشغيل الفيديو"
                        : "Your browser does not support the video tag."}
                    </p>
                  </video>
                </div>
                <p className="text-tea-brown/60 text-xs mt-3 text-center">
                  {language === "ar" 
                    ? "تم إنشاؤه باستخدام Microsoft 365 Copilot Create"
                    : "Created with Microsoft 365 Copilot Create"}
                </p>
              </div>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-tea-green/20 rounded-full flex items-center justify-center">
                    <span className="text-tea-green font-bold text-xl">
                      {language === "ar" ? "١" : "1"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-deep-brown mb-2">
                      {language === "ar" ? "اخلط الشاي جيداً" : "Mix Well"}
                    </h3>
                    <p className="text-tea-brown">
                      {language === "ar" 
                        ? "اخلط خلطة الشاي جيداً قبل كل استخدام لضمان توزيع متساوي للنكهات"
                        : "Mix the tea blend well before each use to ensure even distribution of flavors"}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-tea-green/20 rounded-full flex items-center justify-center">
                    <span className="text-tea-green font-bold text-xl">
                      {language === "ar" ? "٢" : "2"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-deep-brown mb-2">
                      {language === "ar" ? "اغسله برفق" : "Rinse Gently"}
                    </h3>
                    <p className="text-tea-brown">
                      {language === "ar" 
                        ? "خذ المقدار المناسب من خلطة الشاي، ثم اغسله غسلة خفيفة بالماء"
                        : "Take the appropriate amount of tea blend, then rinse it lightly with water"}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-tea-green/20 rounded-full flex items-center justify-center">
                    <span className="text-tea-green font-bold text-xl">
                      {language === "ar" ? "٣" : "3"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-deep-brown mb-2">
                      {language === "ar" ? "اتركه ينضج" : "Let it Steep"}
                    </h3>
                    <p className="text-tea-brown">
                      {language === "ar" 
                        ? "اسكب عليه ماءً مغلياً واتركه على نار هادئة حتى يأخذ الشاي لونه ونكهته"
                        : "Pour boiling water over it and leave it on low heat until the tea gets its color and flavor"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-warm-cream rounded-2xl border-l-4 border-tea-green">
                <p className="text-tea-brown">
                  <span className="font-semibold text-deep-brown">
                    {language === "ar" ? "💡 نصيحة: " : "💡 Tip: "}
                  </span>
                  {language === "ar" 
                    ? "يمكنك التحكم في قوة النكهة حسب رغبتك عن طريق إضافة المزيد من أوراق الشاي"
                    : "You can control the strength of the flavor to your preference by adding more tea leaves"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Services Section */}
      <section id="events" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent-gold/10 via-warm-cream to-tea-green/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-deep-brown mb-4">
              {language === "ar" ? "خدمات المناسبات والفعاليات" : "Events & Occasions Services"}
            </h2>
            <p className="text-xl text-tea-brown max-w-3xl mx-auto">
              {language === "ar" 
                ? "نجعل مناسباتك أكثر تميزاً مع خدمة الضيافة الفاخرة"
                : "Make your occasions more special with our premium hospitality service"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Service Card 1: Event Servers */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-tea-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-tea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-deep-brown mb-3">
                    {language === "ar" ? "خدمة الصبابين المحترفين" : "Professional Tea & Coffee Servers (Sabbabeen)"}
                  </h3>
                  <p className="text-tea-brown mb-4">
                    {language === "ar"
                      ? "نوفر لك صبابين محترفين لتقديم المشروبات في مناسباتك بأسلوب راقي وتقليدي"
                      : "We provide professional servers (sabbabeen) to prepare and serve beverages at your events with elegant, traditional style"}
                  </p>
                  
                  {/* Beverage Options */}
                  <div className="mb-4 p-4 bg-tea-green/10 rounded-xl border-2 border-tea-green/20">
                    <h4 className="font-bold text-deep-brown mb-3 text-base">
                      {language === "ar" ? "المشروبات المتوفرة:" : "Available Beverages:"}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-deep-brown font-medium">
                        <span>☕</span>
                        <span>{language === "ar" ? "قهوة عربية" : "Arabic Coffee"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-deep-brown font-medium">
                        <span>🍵</span>
                        <span>{language === "ar" ? "شاي فاخر" : "Premium Tea"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-deep-brown font-medium">
                        <span>🫖</span>
                        <span>{language === "ar" ? "كرك" : "Karak"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-deep-brown font-medium">
                        <span>🌿</span>
                        <span>{language === "ar" ? "زنجبيل" : "Ginger Tea"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-deep-brown font-medium">
                        <span>🍃</span>
                        <span>{language === "ar" ? "نعناع" : "Mint Tea"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-deep-brown">
                      <svg className="w-5 h-5 text-tea-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{language === "ar" ? "صبابين ذوي خبرة وكفاءة عالية" : "Experienced and highly skilled servers"}</span>
                    </li>
                    <li className="flex items-center gap-2 text-deep-brown">
                      <svg className="w-5 h-5 text-tea-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{language === "ar" ? "زي تقليدي أنيق" : "Elegant traditional attire"}</span>
                    </li>
                    <li className="flex items-center gap-2 text-deep-brown">
                      <svg className="w-5 h-5 text-tea-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{language === "ar" ? "جميع المعدات والأدوات اللازمة" : "All necessary equipment and tools"}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Service Card 2: Special Occasions */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-deep-brown mb-3">
                    {language === "ar" ? "طلبات خاصة للمناسبات" : "Special Occasion Orders"}
                  </h3>
                  <p className="text-tea-brown mb-4">
                    {language === "ar"
                      ? "نوفر طلبات خاصة وباقات مميزة لمختلف المناسبات مع إمكانية التخصيص حسب احتياجاتك"
                      : "We offer special orders and premium packages for various occasions with customization options"}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-deep-brown">
                      <svg className="w-5 h-5 text-tea-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{language === "ar" ? "هدايا رمضان الفاخرة 🌙" : "Premium Ramadan gifts 🌙"}</span>
                    </li>
                    <li className="flex items-center gap-2 text-deep-brown">
                      <svg className="w-5 h-5 text-tea-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{language === "ar" ? "حفلات الزفاف والمناسبات الخاصة 💍" : "Weddings & special events 💍"}</span>
                    </li>
                    <li className="flex items-center gap-2 text-deep-brown">
                      <svg className="w-5 h-5 text-tea-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{language === "ar" ? "هدايا الشركات والمناسبات الرسمية 🎁" : "Corporate & official events 🎁"}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-tea-green to-soft-sage text-white rounded-2xl p-10 shadow-xl">
            <h3 className="text-3xl font-bold mb-4">
              {language === "ar" ? "احجز خدمتك الآن" : "Book Your Service Now"}
            </h3>
            <p className="text-xl mb-6 text-white/90 max-w-2xl mx-auto">
              {language === "ar"
                ? "تواصل معنا عبر واتساب لمناقشة تفاصيل مناسبتك والحصول على عرض سعر مخصص"
                : "Contact us via WhatsApp to discuss your event details and get a custom quote"}
            </p>
            <a
              href="https://wa.me/966539666654"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-warm-cream text-tea-green px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              {language === "ar" ? "تواصل معنا عبر واتساب" : "Contact us on WhatsApp"}
            </a>
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
