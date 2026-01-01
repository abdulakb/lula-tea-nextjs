"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

interface Review {
  id: number;
  customer_name: string;
  overall_rating: number;
  comments: string;
  language: string;
  created_at: string;
}

export default function FeaturedReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchFeaturedReviews();
  }, []);

  const fetchFeaturedReviews = async () => {
    try {
      const response = await fetch('/api/reviews?featured=true&approved=true&limit=3');
      const data = await response.json();
      
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching featured reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Anonymize customer name for privacy
  const anonymizeName = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstName} ${lastInitial}.`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? "text-accent-gold" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-warm-cream dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 bg-tea-brown/20 rounded w-64 mx-auto animate-pulse mb-4"></div>
            <div className="h-6 bg-tea-brown/20 rounded w-96 mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show section if no featured reviews
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-warm-cream dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-deep-brown dark:text-white mb-4"
          >
            {language === "ar" ? "ماذا يقول عملاؤنا" : "What Our Customers Say"}
          </motion.h2>
          <p className="text-lg text-tea-brown dark:text-gray-300">
            {language === "ar" 
              ? "تجارب حقيقية من عملائنا الكرام" 
              : "Real experiences from our valued customers"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-tea-green/10 dark:text-tea-green/5">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Stars */}
              <div className="mb-4">
                {renderStars(review.overall_rating)}
              </div>

              {/* Comment */}
              <p 
                className="text-tea-brown dark:text-gray-300 mb-6 text-lg leading-relaxed italic"
                dir={review.language === "ar" ? "rtl" : "ltr"}
              >
                "{review.comments}"
              </p>

              {/* Customer Info */}
              <div className="border-t border-tea-brown/10 dark:border-gray-700 pt-4">
                <p className="font-bold text-deep-brown dark:text-white">
                  {anonymizeName(review.customer_name)}
                </p>
                <p className="text-sm text-tea-brown/70 dark:text-gray-400">
                  {language === "ar" ? "عميل موثق" : "Verified Customer"}
                </p>
              </div>

              {/* Featured Badge */}
              <div className="absolute top-6 left-6">
                <span className="bg-accent-gold text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ {language === "ar" ? "مميز" : "Featured"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Reviews Link */}
        <div className="text-center mt-12">
          <a
            href="/product#reviews"
            className="inline-block bg-tea-green hover:bg-tea-green/90 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            {language === "ar" ? "عرض جميع التقييمات" : "View All Reviews"}
          </a>
        </div>
      </div>
    </section>
  );
}
