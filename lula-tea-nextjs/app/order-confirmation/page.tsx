"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { t } from "@/lib/i18n";
import Link from "next/link";
import CheckoutProgress from "../components/CheckoutProgress";

function OrderConfirmationContent() {
  const { language } = useLanguage();
  const { clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [invoiceBase64, setInvoiceBase64] = useState<string | null>(null);
  const [hasEmail, setHasEmail] = useState(false);

  useEffect(() => {
    const id = searchParams.get("orderId");
    const invoice = searchParams.get("invoice");
    const emailParam = searchParams.get("hasEmail");
    
    if (!id) {
      router.push("/");
      return;
    }

    setOrderId(id);
    setInvoiceBase64(invoice);
    setHasEmail(emailParam === 'true');
    setHasEmail(emailParam === 'true');

    // Clear cart after successful order (using CartContext to update both state and localStorage)
    clearCart();
  }, [searchParams, router, clearCart]);

  const handleDownloadInvoice = () => {
    if (!orderId) {
      alert(language === "ar" ? "الفاتورة غير متوفرة" : "Invoice not available");
      return;
    }

    // Use direct API endpoint to download PDF
    const downloadUrl = `/api/invoice/${orderId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Lula-Tea-Invoice-${orderId}.pdf`;
    link.click();
  };

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-cream pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <CheckoutProgress currentStep={3} />
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-tea-green rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-deep-brown mb-4">
            {t("orderConfirmed", language)}
          </h1>

          {/* Order ID */}
          <p className="text-gray-600 mb-2">
            {t("orderNumber", language)}: <span className="font-semibold">{orderId}</span>
          </p>

          {/* Success Message */}
          <p className="text-lg text-gray-700 mb-4">
            {t("orderSuccessMessage", language)}
          </p>

          {/* Email Notice - only show if email was provided */}
          {hasEmail && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-blue-900 mb-1">
                  {language === "ar" ? "📧 تحقق من بريدك الإلكتروني" : "📧 Check Your Email"}
                </p>
                <p className="text-sm text-blue-800">
                  {language === "ar" 
                    ? "تم إرسال تأكيد الطلب إلى بريدك الإلكتروني. إذا لم تجده، تحقق من مجلد البريد المزعج/غير المرغوب."
                    : "Order confirmation sent to your email. If you don't see it, please check your spam/junk folder."}
                </p>
              </div>
            </div>
          </div>
          )}

          {/* Download Invoice Button */}
          {invoiceBase64 && (
            <button
              onClick={handleDownloadInvoice}
              className="bg-tea-green text-white px-8 py-3 rounded-lg hover:bg-tea-green/90 transition-colors mb-4 inline-flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t("downloadInvoice", language)}
            </button>
          )}

          {/* Next Steps */}
          <div className="mt-8 p-6 bg-warm-cream rounded-lg text-left">
            <h2 className="text-xl font-semibold text-deep-brown mb-4">
              {t("nextSteps", language)}
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-tea-green mt-1">✓</span>
                <span>{t("nextStep1", language)}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-tea-green mt-1">✓</span>
                <span>{t("nextStep2", language)}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-tea-green mt-1">✓</span>
                <span>{t("nextStep3", language)}</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mt-8 p-6 bg-tea-green/10 rounded-lg">
            <p className="text-gray-700 mb-2">{t("questionsContact", language)}</p>
            <a
              href="https://wa.me/966539666654"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tea-green font-semibold hover:underline inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              +966 53 966 6654
            </a>
          </div>

          {/* Back to Home */}
          <Link
            href="/"
            className="mt-8 inline-block bg-deep-brown text-white px-8 py-3 rounded-lg hover:bg-deep-brown/90 transition-colors"
          >
            {t("backToHome", language)}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-cream pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-green mx-auto mb-4"></div>
          <p className="text-tea-brown">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
