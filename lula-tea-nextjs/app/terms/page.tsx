"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-8">
          {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
        </h1>
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 prose prose-lg max-w-none">
          {language === "ar" ? (
            <>
              <h2>قبول الشروط</h2>
              <p>
                باستخدام موقع لولا تي، فإنك توافق على هذه الشروط والأحكام.
              </p>
              <h2>المنتجات والأسعار</h2>
              <p>
                جميع المنتجات متاحة حسب التوفر. نحتفظ بالحق في تغيير الأسعار دون إشعار مسبق.
              </p>
              <h2>الطلبات والدفع</h2>
              <p>
                يتم تأكيد جميع الطلبات عبر واتساب. الدفع عند الاستلام أو حسب الاتفاق.
              </p>
              <p className="text-sm text-tea-brown mt-8">
                آخر تحديث: نوفمبر 2025
              </p>
            </>
          ) : (
            <>
              <h2>Acceptance of Terms</h2>
              <p>
                By using the Lula Tea website, you agree to these terms and conditions.
              </p>
              <h2>Products and Pricing</h2>
              <p>
                All products are subject to availability. We reserve the right to change prices without prior notice.
              </p>
              <h2>Orders and Payment</h2>
              <p>
                All orders are confirmed via WhatsApp. Payment is cash on delivery or as agreed.
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
