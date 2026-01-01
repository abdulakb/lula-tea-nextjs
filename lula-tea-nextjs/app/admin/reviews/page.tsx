"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabaseClient";

interface Review {
  id: number;
  order_id: string;
  customer_name: string;
  overall_rating: number;
  taste_rating: number;
  quality_rating: number;
  delivery_rating: number;
  comments: string;
  language: string;
  approved: boolean;
  featured: boolean;
  created_at: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin");
      return;
    }
    fetchReviews();
  }, [router]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id: number, updates: Partial<Review>) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      
      // Update local state
      setReviews((prev) =>
        prev.map((review) => (review.id === id ? { ...review, ...updates } : review))
      );
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Failed to update review");
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);

      if (error) throw error;
      
      setReviews((prev) => prev.filter((review) => review.id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  const StarDisplay = ({ rating }: { rating: number }) => (
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

  const filteredReviews = reviews.filter((review) => {
    if (filter === "pending") return !review.approved;
    if (filter === "approved") return review.approved;
    return true;
  });

  // Calculate analytics
  const analytics = {
    total: reviews.length,
    approved: reviews.filter(r => r.approved).length,
    pending: reviews.filter(r => !r.approved).length,
    featured: reviews.filter(r => r.featured).length,
    averageOverall: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1) : 0,
    averageTaste: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.taste_rating, 0) / reviews.length).toFixed(1) : 0,
    averageQuality: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.quality_rating, 0) / reviews.length).toFixed(1) : 0,
    averageDelivery: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.delivery_rating, 0) / reviews.length).toFixed(1) : 0,
  };

  // Identify improvement areas
  const getImprovementPriority = () => {
    if (reviews.length === 0) return null;
    const ratings = [
      { name: 'Taste', score: parseFloat(analytics.averageTaste), icon: '🍵' },
      { name: 'Quality', score: parseFloat(analytics.averageQuality), icon: '✨' },
      { name: 'Delivery', score: parseFloat(analytics.averageDelivery), icon: '🚚' }
    ];
    return ratings.sort((a, b) => a.score - b.score);
  };

  const improvementPriority = getImprovementPriority();

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tea-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-deep-brown dark:text-white">
            Customer Reviews ({reviews.length})
          </h1>
          <button
            onClick={() => router.push("/admin")}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-deep-brown dark:text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Admin
          </button>
        </div>

        {/* Analytics Dashboard */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Average Overall Rating */}
            <div className="bg-gradient-to-br from-tea-green to-tea-green/80 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase opacity-90">Overall Rating</h3>
                <span className="text-3xl">⭐</span>
              </div>
              <p className="text-4xl font-bold">{analytics.averageOverall}</p>
              <p className="text-sm opacity-90 mt-1">Based on {analytics.total} reviews</p>
            </div>

            {/* Taste Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-400">Taste</h3>
                <span className="text-3xl">🍵</span>
              </div>
              <p className="text-4xl font-bold text-deep-brown dark:text-white">{analytics.averageTaste}</p>
              <div className="mt-2">
                <StarDisplay rating={Math.round(parseFloat(analytics.averageTaste))} />
              </div>
            </div>

            {/* Quality Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-400">Quality</h3>
                <span className="text-3xl">✨</span>
              </div>
              <p className="text-4xl font-bold text-deep-brown dark:text-white">{analytics.averageQuality}</p>
              <div className="mt-2">
                <StarDisplay rating={Math.round(parseFloat(analytics.averageQuality))} />
              </div>
            </div>

            {/* Delivery Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-400">Delivery</h3>
                <span className="text-3xl">🚚</span>
              </div>
              <p className="text-4xl font-bold text-deep-brown dark:text-white">{analytics.averageDelivery}</p>
              <div className="mt-2">
                <StarDisplay rating={Math.round(parseFloat(analytics.averageDelivery))} />
              </div>
            </div>
          </div>
        )}

        {/* Improvement Priority Alert */}
        {improvementPriority && improvementPriority[0].score < 4.5 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-lg mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">
                  Priority Improvement Area
                </h3>
                <p className="text-amber-800 dark:text-amber-300">
                  <strong>{improvementPriority[0].icon} {improvementPriority[0].name}</strong> has the lowest rating at <strong>{improvementPriority[0].score}/5.0</strong>
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                  Focus on improving this area to boost customer satisfaction
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "all"
                ? "bg-tea-green text-white"
                : "bg-white dark:bg-gray-800 text-deep-brown dark:text-white"
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "pending"
                ? "bg-tea-green text-white"
                : "bg-white dark:bg-gray-800 text-deep-brown dark:text-white"
            }`}
          >
            Pending ({reviews.filter((r) => !r.approved).length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "approved"
                ? "bg-tea-green text-white"
                : "bg-white dark:bg-gray-800 text-deep-brown dark:text-white"
            }`}
          >
            Approved ({reviews.filter((r) => r.approved).length})
          </button>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-deep-brown dark:text-white">
                      {review.customer_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order: {review.order_id} • {new Date(review.created_at).toLocaleDateString()} • Language: {review.language.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!review.approved && (
                      <button
                        onClick={() => updateReview(review.id, { approved: true })}
                        className="bg-tea-green hover:bg-tea-green/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        ✓ Approve
                      </button>
                    )}
                    {review.approved && !review.featured && (
                      <button
                        onClick={() => updateReview(review.id, { featured: true })}
                        className="bg-accent-gold hover:bg-accent-gold/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        ⭐ Feature
                      </button>
                    )}
                    {review.featured && (
                      <button
                        onClick={() => updateReview(review.id, { featured: false })}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Unfeature
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall</p>
                    <StarDisplay rating={review.overall_rating} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Taste</p>
                    <StarDisplay rating={review.taste_rating} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quality</p>
                    <StarDisplay rating={review.quality_rating} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Delivery</p>
                    <StarDisplay rating={review.delivery_rating} />
                  </div>
                </div>

                {review.comments && (
                  <div className="bg-warm-cream dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-deep-brown dark:text-white italic" dir={review.language === "ar" ? "rtl" : "ltr"}>
                      "{review.comments}"
                    </p>
                  </div>
                )}

                <div className="flex gap-4 mt-4 text-sm">
                  {review.approved && (
                    <span className="text-tea-green font-semibold">✓ Approved</span>
                  )}
                  {review.featured && (
                    <span className="text-accent-gold font-semibold">⭐ Featured</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
