"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LoginPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("error"));
        showToast(data.error || t("error"), "error");
        return;
      }

      showToast(t("loginSuccess"), "success");
      router.push("/account");
    } catch (err) {
      setError(t("error"));
      showToast(t("error"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-cream py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark-brown mb-2">
              {t("login")}
            </h1>
            <p className="text-medium-brown">
              {t("noAccount")}{" "}
              <Link
                href="/signup"
                className="text-tea-green font-semibold hover:underline"
              >
                {t("createAccount")}
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email or Phone */}
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-dark-brown mb-2"
                >
                  {t("email")} / {t("phone")}
                </label>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tea-green focus:border-transparent"
                  placeholder={language === "ar" ? "البريد أو +966501234567" : "Email or +966501234567"}
                  required
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-dark-brown mb-2"
                >
                  {t("password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tea-green focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-medium-brown hover:text-dark-brown"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-tea-green hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-tea-green hover:bg-tea-green/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("loading") : t("login")}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-medium-brown">
                  {t("orContinueWith")}
                </span>
              </div>
            </div>

            {/* Guest Checkout Link */}
            <Link
              href="/checkout"
              className="block w-full text-center border-2 border-tea-green text-tea-green font-semibold py-3 px-6 rounded-lg hover:bg-tea-green/5 transition-colors"
            >
              {t("continueAsGuest")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
