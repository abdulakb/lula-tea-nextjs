"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";

const ThemeToggle = dynamic(() => import("@/app/components/ThemeToggle"), {
  ssr: false,
});

function ReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage, t } = useLanguage();
  const orderId = searchParams.get("order");
  const customerName = searchParams.get("name");

  const [overallRating, setOverallRating] = useState(0);
  const [tasteRating, setTasteRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const StarRating = ({ rating, setRating, label }: { rating: number; setRating: (n: number) => void; label: string }) => {
    return (
      <div className="mb-6">
        <label className="block text-lg font-semibold text-deep-brown dark:text-white mb-3">
          {label}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <svg
                className={`w-12 h-12 ${
                  star <= rating ? "text-accent-gold" : "text-gray-300 dark:text-gray-600"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!overallRating || !tasteRating || !qualityRating || !deliveryRating) {
      alert(language === "ar" ? "يرجى تقييم جميع العناصر" : "Please rate all items");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerName,
          overallRating,
          tasteRating,
          qualityRating,
          deliveryRating,
          comments,
          language,
        }),
      });

      const result = await response.json();
      console.log("Review submission response:", result);

      if (response.ok) {
        setSubmitted(true);
      } else {
        console.error("Review submission failed:", result);
        throw new Error(result.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(language === "ar" ? "حدث خطأ، يرجى المحاولة مرة أخرى" : "Error occurred, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-warm-cream dark:bg-gray-900 py-20 px-4">
        <ThemeToggle />
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12">
            <div className="w-20 h-20 bg-tea-green rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-deep-brown dark:text-white mb-4">
              {language === "ar" ? "شكراً لتقييمك! 💚" : "Thank you for your review! 💚"}
            </h1>
            <p className="text-lg text-tea-brown dark:text-gray-300 mb-8">
              {language === "ar"
                ? "رأيك يساعدنا نطور ويساعد العملاء الجدد"
                : "Your feedback helps us improve and helps new customers"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-tea-green hover:bg-tea-green/90 text-white px-8 py-3 rounded-full font-semibold transition-all"
            >
              {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-cream dark:bg-gray-900 py-20 px-4">
      <ThemeToggle />
      
      {/* Language Toggle */}
      <div className="fixed top-24 right-4 z-50 flex gap-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
        <button
          onClick={() => setLanguage("en")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            language === "en" ? "bg-tea-green text-white" : "text-deep-brown dark:text-gray-300 hover:bg-tea-green/10"
          }`}
        >
          🇬🇧 EN
        </button>
        <button
          onClick={() => setLanguage("ar")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            language === "ar" ? "bg-tea-green text-white" : "text-deep-brown dark:text-gray-300 hover:bg-tea-green/10"
          }`}
        >
          🇸🇦 AR
        </button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-deep-brown dark:text-white mb-4">
              {language === "ar" ? "⭐ قيّم تجربتك" : "⭐ Rate Your Experience"}
            </h1>
            <p className="text-lg text-tea-brown dark:text-gray-300 mb-3">
              {language === "ar"
                ? `مرحباً ${customerName || ""}! نحب نسمع رأيك`
                : `Hello ${customerName || ""}! We'd love your feedback`}
            </p>
            
            {/* Privacy Notice */}
            <div className="inline-flex items-center gap-2 bg-tea-green/10 border border-tea-green/30 rounded-full px-4 py-2 text-sm">
              <svg className="w-4 h-4 text-tea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-tea-brown dark:text-gray-300">
                {language === "ar" 
                  ? "خصوصيتك مهمة - سنعرض فقط اسمك الأول وحرف من اسم العائلة" 
                  : "Privacy protected - Only your first name and last initial will be shown publicly"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <StarRating
              rating={overallRating}
              setRating={setOverallRating}
              label={language === "ar" ? "التقييم العام" : "Overall Experience"}
            />

            <StarRating
              rating={tasteRating}
              setRating={setTasteRating}
              label={language === "ar" ? "طعم الشاي" : "Tea Taste"}
            />

            <StarRating
              rating={qualityRating}
              setRating={setQualityRating}
              label={language === "ar" ? "الجودة" : "Quality"}
            />

            <StarRating
              rating={deliveryRating}
              setRating={setDeliveryRating}
              label={language === "ar" ? "وقت التوصيل" : "Delivery Time"}
            />

            <div className="mb-6">
              <label className="block text-lg font-semibold text-deep-brown dark:text-white mb-3">
                {language === "ar" ? "تعليقات إضافية (اختياري)" : "Additional Comments (Optional)"}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder={
                  language === "ar"
                    ? "شاركنا تجربتك بكلماتك..."
                    : "Share your experience in your own words..."
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white"
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-tea-green hover:bg-tea-green/90 disabled:bg-gray-400 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{language === "ar" ? "جاري الإرسال..." : "Submitting..."}</span>
                </>
              ) : (
                <span>{language === "ar" ? "إرسال التقييم" : "Submit Review"}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tea-green"></div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
