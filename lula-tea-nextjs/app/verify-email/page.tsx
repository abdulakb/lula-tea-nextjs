"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || t("verifyEmailSuccess"));
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred");
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-warm-cream py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {status === "loading" && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-tea-green border-t-transparent rounded-full animate-spin"></div>
                <h2 className="text-2xl font-bold text-dark-brown mb-2">
                  {t("loading")}
                </h2>
                <p className="text-medium-brown">
                  Verifying your email...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-tea-green rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-dark-brown mb-2">
                  {t("success")}
                </h2>
                <p className="text-medium-brown mb-6">
                  {message}
                </p>
                <p className="text-sm text-medium-brown">
                  Redirecting to login...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-dark-brown mb-2">
                  {t("error")}
                </h2>
                <p className="text-medium-brown mb-6">
                  {message}
                </p>
                <Link
                  href="/login"
                  className="inline-block bg-tea-green hover:bg-tea-green/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {t("login")}
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
