"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-8">
          {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 prose prose-lg max-w-none">
          {language === "ar" ? (
            <>
              <h2>معلومات عامة</h2>
              <p>
                نحن في لولا تي نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية.
              </p>
              <h2>جمع المعلومات</h2>
              <p>
                نقوم بجمع المعلومات التي تقدمها طوعاً عند التسجيل أو تقديم طلب.
              </p>
              <h2>استخدام المعلومات</h2>
              <p>
                نستخدم معلوماتك لمعالجة الطلبات وتحسين خدماتنا.
              </p>
              <p className="text-sm text-tea-brown mt-8">
                آخر تحديث: نوفمبر 2025
              </p>
            </>
          ) : (
            <>
              <h2>General Information</h2>
              <p>
                At Lula Tea, we respect your privacy and are committed to protecting your personal information.
              </p>
              <h2>Information Collection</h2>
              <p>
                We collect information that you voluntarily provide when registering or placing an order.
              </p>
              <h2>Use of Information</h2>
              <p>
                We use your information to process orders and improve our services.
              </p>
              <p className="text-sm text-tea-brown mt-8">
                Last updated: November 2025
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
