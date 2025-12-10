"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

interface StockNotificationFormProps {
  productId: string;
  productName: string;
}

export default function StockNotificationForm({ productId, productName }: StockNotificationFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notifyVia, setNotifyVia] = useState<"email" | "whatsapp">("whatsapp");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (notifyVia === "email" && !email) {
      showToast(
        language === "ar" ? "الرجاء إدخال البريد الإلكتروني" : "Please enter your email",
        "warning"
      );
      return;
    }

    if (notifyVia === "whatsapp" && !phone) {
      showToast(
        language === "ar" ? "الرجاء إدخال رقم الواتساب" : "Please enter your WhatsApp number",
        "warning"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          product_name: productName,
          email: notifyVia === "email" ? email : null,
          phone: notifyVia === "whatsapp" ? phone : null,
          notify_via: notifyVia,
          language,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        showToast(
          language === "ar" 
            ? "تم التسجيل بنجاح! سنخبرك عند توفر المنتج" 
            : "Successfully registered! We'll notify you when back in stock",
          "success"
        );
        setEmail("");
        setPhone("");
        
        // Reset success state after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        throw new Error('Failed to register');
      }
    } catch (error) {
      console.error('Error registering for stock notification:', error);
      showToast(
        language === "ar" 
          ? "حدث خطأ. الرجاء المحاولة مرة أخرى" 
          : "An error occurred. Please try again",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-tea-green/10 to-accent-gold/10 rounded-2xl p-6 border-2 border-tea-green/20">
      <div className="flex items-start gap-3 mb-4">
        <svg
          className="w-6 h-6 text-tea-green flex-shrink-0 mt-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <div>
          <h3 className="text-lg font-bold text-deep-brown mb-1">
            {language === "ar" ? "نفذت الكمية؟" : "Out of Stock?"}
          </h3>
          <p className="text-tea-brown text-sm">
            {language === "ar" 
              ? "سجل الآن لنخبرك فور توفر المنتج مرة أخرى" 
              : "Register now and we'll notify you when it's back in stock"}
          </p>
        </div>
      </div>

      {isSuccess ? (
        <div className="bg-tea-green/20 border border-tea-green rounded-xl p-4 text-center">
          <svg
            className="w-12 h-12 text-tea-green mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-deep-brown font-semibold">
            {language === "ar" ? "تم التسجيل بنجاح!" : "Successfully Registered!"}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Notification method selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setNotifyVia("whatsapp")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                notifyVia === "whatsapp"
                  ? "bg-[#25D366] text-white shadow-lg"
                  : "bg-white text-tea-brown border-2 border-tea-brown/20"
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setNotifyVia("email")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                notifyVia === "email"
                  ? "bg-tea-green text-white shadow-lg"
                  : "bg-white text-tea-brown border-2 border-tea-brown/20"
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {language === "ar" ? "بريد إلكتروني" : "Email"}
            </button>
          </div>

          {/* Input field */}
          {notifyVia === "email" ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"}
              className="w-full px-4 py-3 rounded-xl border-2 border-tea-brown/20 focus:border-tea-green focus:outline-none text-deep-brown"
              required
            />
          ) : (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={language === "ar" ? "رقم الواتساب (مثال: 966501234567)" : "WhatsApp number (e.g., 966501234567)"}
              className="w-full px-4 py-3 rounded-xl border-2 border-tea-brown/20 focus:border-tea-green focus:outline-none text-deep-brown"
              required
            />
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-tea-green hover:bg-tea-green/90 disabled:bg-tea-brown/30 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {language === "ar" ? "جاري التسجيل..." : "Registering..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {language === "ar" ? "أخبرني عند التوفر" : "Notify Me When Available"}
              </span>
            )}
          </button>

          <p className="text-xs text-tea-brown text-center">
            {language === "ar" 
              ? "سنرسل لك إشعاراً واحداً فقط عند توفر المنتج" 
              : "We'll send you a single notification when the product is back in stock"}
          </p>
        </form>
      )}
    </div>
  );
}
