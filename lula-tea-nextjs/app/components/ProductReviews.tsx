"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ReviewSkeleton } from "./SkeletonLoaders";

interface Review {
  id: number;
  customer_name: string;
  overall_rating: number;
  taste_rating: number;
  quality_rating: number;
  delivery_rating: number;
  comments: string;
  language: string;
  created_at: string;
  featured: boolean;
}

export default function ProductReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const { language, t } = useLanguage();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews?approved=true');
      const data = await response.json();
      
      if (data.reviews) {
        setReviews(data.reviews);
        
        // Calculate average rating
        if (data.reviews.length > 0) {
          const avg = data.reviews.reduce((sum: number, r: Review) => sum + r.overall_rating, 0) / data.reviews.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: string = "w-5 h-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${size} ${star <= rating ? "text-accent-gold" : "text-tea-brown/20"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-warm-cream rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-tea-brown/10">
          <div className="space-y-3">
            <div className="h-8 bg-tea-brown/20 rounded w-48 animate-pulse"></div>
            <div className="h-6 bg-tea-brown/20 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-6">
          <ReviewSkeleton />
          <ReviewSkeleton />
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-warm-cream rounded-3xl p-8 text-center">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-tea-brown/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <p className="text-tea-brown font-semibold mb-2">
          {language === "ar" ? "كن أول من يقيم منتجاتنا" : "Be the first to review"}
        </p>
        <p className="text-tea-brown/70">
          {language === "ar" 
            ? "شارك تجربتك مع لولا تي" 
            : "Share your experience with Lula Tea"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-warm-cream rounded-3xl p-8">
      {/* Header with average rating */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-tea-brown/10">
        <div>
          <h3 className="text-2xl font-bold text-deep-brown mb-2">
            {language === "ar" ? "تقييمات العملاء" : "Customer Reviews"}
          </h3>
          <div className="flex items-center gap-3">
            {renderStars(Math.round(averageRating), "w-6 h-6")}
            <span className="text-2xl font-bold text-deep-brown">{averageRating}</span>
            <span className="text-tea-brown">
              ({reviews.length} {language === "ar" ? "تقييم" : "reviews"})
            </span>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`bg-white rounded-2xl p-6 shadow-md ${
              review.featured ? "ring-2 ring-accent-gold" : ""
            }`}
          >
            {review.featured && (
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-accent-gold">
                  {language === "ar" ? "تقييم مميز" : "Featured Review"}
                </span>
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-deep-brown text-lg">{review.customer_name}</p>
                <p className="text-sm text-tea-brown">{formatDate(review.created_at)}</p>
              </div>
              {renderStars(review.overall_rating)}
            </div>

            {/* Detailed ratings */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-warm-cream/50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-tea-brown mb-1">
                  {language === "ar" ? "الطعم" : "Taste"}
                </p>
                {renderStars(review.taste_rating, "w-4 h-4")}
              </div>
              <div className="text-center">
                <p className="text-xs text-tea-brown mb-1">
                  {language === "ar" ? "الجودة" : "Quality"}
                </p>
                {renderStars(review.quality_rating, "w-4 h-4")}
              </div>
              <div className="text-center">
                <p className="text-xs text-tea-brown mb-1">
                  {language === "ar" ? "التوصيل" : "Delivery"}
                </p>
                {renderStars(review.delivery_rating, "w-4 h-4")}
              </div>
            </div>

            {review.comments && (
              <p className="text-tea-brown leading-relaxed">{review.comments}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
