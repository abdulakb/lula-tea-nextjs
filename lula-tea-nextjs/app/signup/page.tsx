"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function SignupPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [usePhone, setUsePhone] = useState(false);

  const validatePassword = (pwd: string) => {
    const errors = [];
    if (pwd.length < 8) errors.push(t("passwordMin8"));
    if (!/[A-Z]/.test(pwd)) errors.push(t("passwordUppercase"));
    if (!/[a-z]/.test(pwd)) errors.push(t("passwordLowercase"));
    if (!/[0-9]/.test(pwd)) errors.push(t("passwordNumber"));
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      showToast(t("passwordMismatch"), "error");
      return;
    }

    // Validate password strength
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setError(pwdErrors.join(", "));
      showToast(pwdErrors.join(", "), "error");
      return;
    }

    // Validate email or phone is provided
    if (!email && !phone) {
      setError(t("required"));
      showToast(language === "ar" ? "يرجى إدخال البريد الإلكتروني أو رقم الهاتف" : "Please provide email or phone", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("error"));
        showToast(data.error || t("error"), "error");
        return;
      }

      showToast(t("signupSuccess"), "success");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(t("error"));
      showToast(t("error"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordErrors = password ? validatePassword(password) : [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-cream py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark-brown mb-2">
              {t("createAccount")}
            </h1>
            <p className="text-medium-brown">
              {t("haveAccount")}{" "}
              <Link
                href="/login"
                className="text-tea-green font-semibold hover:underline"
              >
                {t("login")}
              </Link>
            </p>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-dark-brown mb-2"
                >
                  {t("name")} *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tea-green focus:border-transparent"
                  required
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
              </div>

              {/* Toggle Email/Phone */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUsePhone(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    !usePhone
                      ? "bg-tea-green text-white"
                      : "bg-gray-100 text-medium-brown hover:bg-gray-200"
                  }`}
                >
                  {t("email")}
                </button>
                <button
                  type="button"
                  onClick={() => setUsePhone(true)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    usePhone
                      ? "bg-tea-green text-white"
                      : "bg-gray-100 text-medium-brown hover:bg-gray-200"
                  }`}
                >
                  {t("phone")}
                </button>
              </div>

              {/* Email or Phone */}
              {!usePhone ? (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-dark-brown mb-2"
                  >
                    {t("email")} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tea-green focus:border-transparent"
                    placeholder={t("emailPlaceholder")}
                    required={!usePhone}
                    dir="ltr"
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-dark-brown mb-2"
                  >
                    {t("phone")} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tea-green focus:border-transparent"
                    placeholder="+966501234567"
                    required={usePhone}
                    dir="ltr"
                  />
                  <p className="text-xs text-medium-brown mt-1">
                    {language === "ar" 
                      ? "يجب أن يبدأ برمز المملكة +966"
                      : "Must start with +966 (Saudi Arabia)"}
                  </p>
                </div>
              )}

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-dark-brown mb-2"
                >
                  {t("password")} *
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

                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-medium-brown">
                      {t("passwordRequirements")}
                    </p>
                    {[
                      { key: "passwordMin8", check: password.length >= 8 },
                      { key: "passwordUppercase", check: /[A-Z]/.test(password) },
                      { key: "passwordLowercase", check: /[a-z]/.test(password) },
                      { key: "passwordNumber", check: /[0-9]/.test(password) },
                    ].map(({ key, check }) => (
                      <p
                        key={key}
                        className={`text-xs ${
                          check ? "text-tea-green" : "text-medium-brown"
                        }`}
                      >
                        {check ? "✓" : "○"} {t(key as any)}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-dark-brown mb-2"
                >
                  {t("confirmPassword")} *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tea-green focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || passwordErrors.length > 0}
                className="w-full bg-tea-green hover:bg-tea-green/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("loading") : t("createAccount")}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
