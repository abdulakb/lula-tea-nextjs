"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { signInWithMagicLink, signOut, getUser } from "@/lib/supabaseClient";

export default function AccountPage() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { user } = await getUser();
      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await signInWithMagicLink(email);
      if (error) throw error;
      
      setMessage(
        language === "ar"
          ? "تم إرسال رابط سحري إلى بريدك الإلكتروني!"
          : "Magic link sent to your email!"
      );
    } catch (error: any) {
      setMessage(
        language === "ar"
          ? `خطأ: ${error.message}`
          : `Error: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      setMessage(language === "ar" ? "تم تسجيل الخروج" : "Signed out successfully");
    } catch (error: any) {
      setMessage(
        language === "ar"
          ? `خطأ: ${error.message}`
          : `Error: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-2xl text-tea-brown">
          {language === "ar" ? "جاري التحميل..." : "Loading..."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-12 text-center">
          {t("accountTitle")}
        </h1>

        {!user ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-deep-brown mb-4">{t("signIn")}</h2>
            <p className="text-tea-brown mb-6">{t("signInDescription")}</p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                className="w-full px-4 py-3 rounded-lg border border-tea-brown/20 focus:border-tea-green focus:outline-none focus:ring-2 focus:ring-tea-green/20"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-tea-green hover:bg-tea-green/90 text-white px-6 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading
                  ? language === "ar"
                    ? "جاري الإرسال..."
                    : "Sending..."
                  : t("sendMagicLink")}
              </button>
            </form>

            {message && (
              <div className="mt-4 p-4 rounded-lg bg-tea-green/10 text-tea-green text-center">
                {message}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-deep-brown mb-4">
                {language === "ar" ? "مرحباً!" : "Welcome!"}
              </h2>
              <p className="text-tea-brown mb-6">
                {language === "ar" ? `البريد الإلكتروني: ${user.email}` : `Email: ${user.email}`}
              </p>
              <button
                onClick={handleSignOut}
                className="bg-tea-brown hover:bg-deep-brown text-white px-6 py-3 rounded-full font-semibold transition-all"
              >
                {t("signOut")}
              </button>
            </div>

            <div className="bg-warm-cream rounded-3xl shadow-xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-deep-brown mb-6">{t("orderHistory")}</h2>
              <p className="text-tea-brown text-center py-8">{t("noOrders")}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
