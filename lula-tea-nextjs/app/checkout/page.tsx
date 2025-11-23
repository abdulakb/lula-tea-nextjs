"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAnalytics } from "@/context/AnalyticsContext";
import { openWhatsApp } from "@/lib/whatsapp";

export default function CheckoutPage() {
  const { t, language } = useLanguage();
  const { items, subtotal } = useCart();
  const { trackEvent } = useAnalytics();
  const router = useRouter();

  // Track checkout start
  useEffect(() => {
    trackEvent("checkout_start", {
      cart_value: subtotal,
      item_count: items.length,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  }, []);
  
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "whatsapp">("cod");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert(language === "ar" ? "المتصفح لا يدعم تحديد الموقع" : "Browser doesn't support geolocation");
      return;
    }

    setLoadingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Google Maps Geocoding API (you can also use other services)
          // For now, just show coordinates - you can integrate a geocoding service later
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          // Try to get address using reverse geocoding (optional - requires API key)
          // For now, just use coordinates
          setDeliveryAddress(locationString);
          setDeliveryNotes(
            (deliveryNotes ? deliveryNotes + "\n" : "") + 
            `Location: https://maps.google.com/?q=${latitude},${longitude}`
          );
          
        } catch (err) {
          console.error("Geocoding error:", err);
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setDeliveryAddress(locationString);
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error("Location error:", err);
        setError(
          language === "ar" 
            ? "فشل الحصول على الموقع. يرجى السماح بالوصول إلى الموقع." 
            : "Failed to get location. Please allow location access."
        );
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleWhatsAppCheckout = () => {
    openWhatsApp(items, subtotal, language);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate required fields
    if (!customerName || !customerPhone || !deliveryAddress) {
      setError(language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderItems = items.map(item => ({
        name: item.name,
        nameAr: item.nameAr,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress: deliveryAddress,
        deliveryNotes,
        items: orderItems,
        subtotal,
        deliveryFee: 0,
        total: subtotal,
        paymentMethod,
        language,
      };

      // Submit order to API
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create order");
      }

      // Track purchase completion
      trackEvent("purchase", {
        order_id: result.orderId,
        total_value: subtotal,
        payment_method: paymentMethod,
        item_count: items.length,
        items: orderItems,
      });

      // Redirect to confirmation page with order details
      router.push(`/order-confirmation?orderId=${result.orderId}&invoice=${result.invoiceBase64}`);
    } catch (err) {
      console.error("Order submission error:", err);
      setError(language === "ar" ? "فشل إنشاء الطلب. يرجى المحاولة مرة أخرى." : "Failed to create order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-warm-cream">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-4">
            {t("checkoutTitle")}
          </h1>
          <p className="text-xl text-tea-brown">{t("checkoutDescription")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-deep-brown mb-6">
              {language === "ar" ? "ملخص الطلب" : "Order Summary"}
            </h2>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-4 pb-4 border-b border-tea-brown/10">
                <div>
                  <p className="font-semibold text-deep-brown">
                    {language === "ar" ? item.nameAr : item.name}
                  </p>
                  <p className="text-sm text-tea-brown">
                    {language === "ar" ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                  </p>
                </div>
                <span className="font-semibold text-deep-brown">
                  {language === "ar" ? `${item.price * item.quantity} ريال` : `${item.price * item.quantity} SAR`}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t-2 border-tea-green">
              <span className="text-xl font-bold text-deep-brown">{t("subtotal")}</span>
              <span className="text-2xl font-bold text-tea-green">
                {language === "ar" ? `${subtotal} ريال` : `${subtotal} SAR`}
              </span>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-deep-brown mb-3">
                {t("paymentMethod")}
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-tea-green/30 rounded-lg cursor-pointer hover:bg-tea-green/5 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value as "cod")}
                    className="w-4 h-4 text-tea-green focus:ring-tea-green"
                  />
                  <span className="ml-3 text-deep-brown font-medium">
                    {t("cashOnDelivery")}
                  </span>
                </label>
                
                <label className="flex items-center p-4 border-2 border-tea-green/30 rounded-lg cursor-pointer hover:bg-tea-green/5 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="whatsapp"
                    checked={paymentMethod === "whatsapp"}
                    onChange={(e) => setPaymentMethod(e.target.value as "whatsapp")}
                    className="w-4 h-4 text-tea-green focus:ring-tea-green"
                  />
                  <span className="ml-3 text-deep-brown font-medium">
                    {t("whatsappOrder")}
                  </span>
                </label>
              </div>
            </div>

            {paymentMethod === "whatsapp" ? (
              // WhatsApp Checkout
              <div>
                <p className="text-tea-brown mb-6 text-center">{t("scanQR")}</p>
                
                <div className="bg-warm-cream rounded-2xl p-6 mb-6">
                  <div className="relative w-full max-w-xs mx-auto aspect-square">
                    <Image
                      src="/images/whatsapp-barcode.jpg"
                      alt="WhatsApp QR Code"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-[#25D366] hover:bg-[#22c55e] text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  {t("chatOnWhatsApp")}
                </button>
              </div>
            ) : (
              // COD Checkout Form
              <form onSubmit={handleSubmitOrder}>
                <h3 className="text-lg font-semibold text-deep-brown mb-4">
                  {t("customerInformation")}
                </h3>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-deep-brown mb-2">
                      {t("fullName")} *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-brown mb-2">
                      {language === "ar" ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={language === "ar" ? "your@email.com" : "your@email.com"}
                      className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green"
                    />
                    <p className="text-xs text-tea-brown mt-1">
                      {language === "ar" ? "لتلقي تأكيد الطلب عبر البريد الإلكتروني" : "To receive order confirmation via email"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-brown mb-2">
                      {t("phoneNumber")} *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-brown mb-2">
                      {t("deliveryAddress")} *
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        rows={3}
                        className="flex-1 px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green"
                        placeholder={language === "ar" ? "أدخل عنوانك أو استخدم موقعك" : "Enter your address or use your location"}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={loadingLocation}
                      className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:bg-gray-400"
                    >
                      {loadingLocation ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          <span>{language === "ar" ? "جاري تحديد الموقع..." : "Getting location..."}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{language === "ar" ? "📍 استخدم موقعي الحالي" : "📍 Use My Current Location"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-deep-brown mb-2">
                      {t("deliveryNotes")}
                    </label>
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      rows={2}
                      placeholder={t("deliveryNotesPlaceholder")}
                      className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-tea-green hover:bg-tea-green/90 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting 
                      ? (language === "ar" ? "جارٍ المعالجة..." : "Processing...") 
                      : t("confirmOrder")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
