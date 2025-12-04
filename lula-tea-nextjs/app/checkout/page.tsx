"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAnalytics } from "@/context/AnalyticsContext";
import { openWhatsApp } from "@/lib/whatsapp";

const ThemeToggle = dynamic(() => import("@/app/components/ThemeToggle"), {
  ssr: false,
});

export default function CheckoutPage() {
  const { t, language } = useLanguage();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
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

    // Auto-scroll to form on mobile to avoid confusion
    // Wait for page to fully load before scrolling
    const timer = setTimeout(() => {
      const formSection = document.getElementById("checkout-form");
      if (formSection && window.innerWidth < 1024) {
        // Only auto-scroll on mobile/tablet (< 1024px)
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);
  
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stcpay" | "whatsapp">("cod");
  const [showStcInstructions, setShowStcInstructions] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [gpsCoordinates, setGpsCoordinates] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [qualifiesForFreeDelivery, setQualifiesForFreeDelivery] = useState(false);
  const [distanceFromWarehouse, setDistanceFromWarehouse] = useState<number | null>(null);
  const [deliveryCity, setDeliveryCity] = useState<string>("");
  const [deliveryEligibility, setDeliveryEligibility] = useState<{
    qualifies: boolean;
    distance: number;
    city?: string;
    totalPacks: number;
    nearWarehouse: boolean;
    inMajorCity: boolean;
  } | null>(null);

  // Warehouse location: VJFG+67J, Al Aarid, Riyadh 13338
  const WAREHOUSE_LAT = 24.773125;
  const WAREHOUSE_LNG = 46.725625;
  const FREE_DELIVERY_RADIUS_KM = 20; // ~20 minutes drive from warehouse
  const MIN_PACKS_FOR_FREE_DELIVERY_NEAR = 3; // 3 packs within 20km
  const MIN_PACKS_FOR_FREE_DELIVERY_CITY = 5; // 5 packs anywhere in Riyadh or Jeddah

  // Major city boundaries (approximate)
  const RIYADH_BOUNDS = {
    minLat: 24.4, maxLat: 25.0,
    minLng: 46.3, maxLng: 47.0
  };
  const JEDDAH_BOUNDS = {
    minLat: 21.3, maxLat: 21.8,
    minLng: 39.0, maxLng: 39.4
  };

  const isInCity = (lat: number, lng: number): string => {
    if (lat >= RIYADH_BOUNDS.minLat && lat <= RIYADH_BOUNDS.maxLat &&
        lng >= RIYADH_BOUNDS.minLng && lng <= RIYADH_BOUNDS.maxLng) {
      return "Riyadh";
    }
    if (lat >= JEDDAH_BOUNDS.minLat && lat <= JEDDAH_BOUNDS.maxLat &&
        lng >= JEDDAH_BOUNDS.minLng && lng <= JEDDAH_BOUNDS.maxLng) {
      return "Jeddah";
    }
    return "";
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkFreeDeliveryEligibility = (latitude: number, longitude: number) => {
    const distance = calculateDistance(latitude, longitude, WAREHOUSE_LAT, WAREHOUSE_LNG);
    setDistanceFromWarehouse(distance);
    
    const totalPacks = items.reduce((sum, item) => sum + item.quantity, 0);
    const city = isInCity(latitude, longitude);
    setDeliveryCity(city);
    
    // Check eligibility:
    // 1. Within 20km radius AND 3+ packs
    // 2. OR within Riyadh/Jeddah AND 5+ packs
    const nearWarehouse = distance <= FREE_DELIVERY_RADIUS_KM && totalPacks >= MIN_PACKS_FOR_FREE_DELIVERY_NEAR;
    const inMajorCity = !!city && totalPacks >= MIN_PACKS_FOR_FREE_DELIVERY_CITY;
    
    const qualifies = nearWarehouse || inMajorCity;
    setQualifiesForFreeDelivery(qualifies);
    
    return { qualifies, distance, totalPacks, city, nearWarehouse, inMajorCity };
  };

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
          // Check free delivery eligibility
          const eligibility = checkFreeDeliveryEligibility(latitude, longitude);
          setDeliveryEligibility(eligibility);
          
          // Get full address using reverse geocoding
          let fullAddress = "";
          try {
            // Using Nominatim (OpenStreetMap) - Free, no API key required
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=${language === "ar" ? "ar" : "en"}`,
              {
                headers: {
                  'User-Agent': 'LulaTeaApp/1.0'
                }
              }
            );
            
            if (geocodeResponse.ok) {
              const geocodeData = await geocodeResponse.json();
              const addr = geocodeData.address;
              
              // Build formatted address
              const addressParts = [];
              
              // Add building/house number
              if (addr.house_number) addressParts.push(addr.house_number);
              
              // Add road/street
              if (addr.road) addressParts.push(addr.road);
              
              // Add suburb/district
              if (addr.suburb) addressParts.push(addr.suburb);
              else if (addr.neighbourhood) addressParts.push(addr.neighbourhood);
              else if (addr.quarter) addressParts.push(addr.quarter);
              
              // Add city
              if (addr.city) addressParts.push(addr.city);
              else if (addr.town) addressParts.push(addr.town);
              
              // Add postcode
              if (addr.postcode) addressParts.push(addr.postcode);
              
              fullAddress = addressParts.join(", ");
              
              // If we got a good address, use it
              if (fullAddress && fullAddress.length > 10) {
                setDeliveryAddress(fullAddress);
              } else {
                // Fallback to display_name
                fullAddress = geocodeData.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                setDeliveryAddress(fullAddress);
              }
            } else {
              // Fallback to coordinates if geocoding fails
              fullAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setDeliveryAddress(fullAddress);
            }
          } catch (geocodeError) {
            console.error("Geocoding error:", geocodeError);
            // Fallback to coordinates
            fullAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setDeliveryAddress(fullAddress);
          }
          
          const coordsString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setGpsCoordinates(coordsString);
          
          let notesText = `GPS: ${coordsString}\nMaps: https://maps.google.com/?q=${latitude},${longitude}`;
          
          // Add eligibility info to notes
          if (eligibility.qualifies) {
            notesText += `\n✅ FREE DELIVERY QUALIFIED`;
            if (eligibility.nearWarehouse) {
              notesText += ` (Within ${eligibility.distance.toFixed(1)}km from warehouse)`;
            } else if (eligibility.inMajorCity) {
              notesText += ` (${eligibility.city} - ${eligibility.totalPacks} packs)`;
            }
          } else {
            if (eligibility.city) {
              const needed = MIN_PACKS_FOR_FREE_DELIVERY_CITY - eligibility.totalPacks;
              notesText += `\n📦 Add ${needed} more pack${needed > 1 ? 's' : ''} for FREE delivery in ${eligibility.city}`;
            } else if (eligibility.distance <= FREE_DELIVERY_RADIUS_KM) {
              const needed = MIN_PACKS_FOR_FREE_DELIVERY_NEAR - eligibility.totalPacks;
              notesText += `\n📦 Add ${needed} more pack${needed > 1 ? 's' : ''} for FREE delivery (${eligibility.distance.toFixed(1)}km from warehouse)`;
            }
          }
          
          setDeliveryNotes(notesText);
          
        } catch (err) {
          console.error("Location processing error:", err);
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
    openWhatsApp({
      items,
      subtotal,
      language,
      customerName,
      deliveryAddress,
      deliveryTime,
      gpsCoordinates,
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate required fields
    if (!customerName || !customerPhone || !deliveryAddress || !deliveryTime) {
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
        deliveryTime,
        gpsCoordinates,
        items: orderItems,
        subtotal,
        deliveryFee: 0,
        total: subtotal,
        paymentMethod,
        language,
        qualifiesForFreeDelivery: deliveryEligibility?.qualifies || false,
      };

      // For COD, submit order to API
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

      // Auto-open WhatsApp with invoice for customer
      if (result.customerInvoiceWhatsappUrl) {
        console.log("Opening WhatsApp with invoice for customer...");
        window.open(result.customerInvoiceWhatsappUrl, '_blank');
      }

      // Clear cart before redirecting
      clearCart();

      // Redirect to confirmation page with order details
      router.push(`/order-confirmation?orderId=${result.orderId}&invoice=${result.invoiceBase64}`);
    } catch (err) {
      console.error("Order submission error:", err);
      setError(language === "ar" ? "فشل إنشاء الطلب. يرجى المحاولة مرة أخرى." : "Failed to create order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-warm-cream dark:bg-gray-900 dark-transition">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t("checkout")}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">{t("checkoutDescription")}</p>
        </div>

        {/* Free Delivery Teaser - Before location shared */}
        {distanceFromWarehouse === null && (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl">📍</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  {language === "ar" ? "قد تكون مؤهلاً للتوصيل المجاني!" : "You might qualify for FREE delivery!"}
                </h3>
                <p className="text-white/90">
                  {language === "ar" 
                    ? "شارك موقعك لنتحقق من أهليتك للتوصيل المجاني"
                    : "Share your location to check if you qualify for free delivery"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Eligibility Result - After location shared */}
        {distanceFromWarehouse !== null && (
          <>
            {qualifiesForFreeDelivery ? (
              <div className="mb-8 bg-green-100 border-2 border-green-500 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🎉</span>
                  <div>
                    <p className="text-xl font-bold text-green-800">
                      {language === "ar" 
                        ? "مبروك! أنت مؤهل للتوصيل المجاني!" 
                        : "Congratulations! You qualify for FREE delivery!"}
                    </p>
                    <p className="text-green-700">
                      {deliveryCity && (
                        language === "ar"
                          ? `موقعك في ${deliveryCity} - التوصيل مجاني!`
                          : `Your location in ${deliveryCity} - Delivery is FREE!`
                      )}
                      {!deliveryCity && distanceFromWarehouse && (
                        language === "ar"
                          ? `موقعك على بُعد ${distanceFromWarehouse.toFixed(1)} كم - التوصيل مجاني!`
                          : `Your location is ${distanceFromWarehouse.toFixed(1)}km away - Delivery is FREE!`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 bg-amber-100 border-2 border-amber-500 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">📦</span>
                  <div>
                    <p className="text-xl font-bold text-amber-800">
                      {language === "ar" 
                        ? "رسوم التوصيل: 25 ريال" 
                        : "Delivery Fee: 25 SAR"}
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      {(() => {
                        const totalPacks = items.reduce((sum, item) => sum + item.quantity, 0);
                        if (deliveryCity) {
                          const needed = MIN_PACKS_FOR_FREE_DELIVERY_CITY - totalPacks;
                          return language === "ar"
                            ? `أضف ${needed} علبة أخرى للحصول على توصيل مجاني في ${deliveryCity}`
                            : `Add ${needed} more pack${needed > 1 ? 's' : ''} for FREE delivery in ${deliveryCity}`;
                        } else if (distanceFromWarehouse <= FREE_DELIVERY_RADIUS_KM) {
                          const needed = MIN_PACKS_FOR_FREE_DELIVERY_NEAR - totalPacks;
                          return language === "ar"
                            ? `أضف ${needed} علبة أخرى للحصول على توصيل مجاني (${distanceFromWarehouse.toFixed(1)} كم من المستودع)`
                            : `Add ${needed} more pack${needed > 1 ? 's' : ''} for FREE delivery (${distanceFromWarehouse.toFixed(1)}km from warehouse)`;
                        } else {
                          return language === "ar"
                            ? "موقعك خارج نطاق التوصيل المجاني"
                            : "Your location is outside the free delivery area";
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {language === "ar" ? "ملخص الطلب" : "Order Summary"}
            </h2>
            {items.map((item) => (
              <div key={item.id} className="mb-4 pb-4 border-b border-tea-brown/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {language === "ar" ? item.nameAr : item.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === "ar" ? `${item.price} ريال للكيس` : `${item.price} SAR per pack`}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {language === "ar" ? `${item.price * item.quantity} ريال` : `${item.price * item.quantity} SAR`}
                  </span>
                </div>
                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === "ar" ? "الكمية:" : "Quantity:"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white font-bold"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-tea-green hover:bg-tea-green/90 rounded-lg transition-colors text-white font-bold"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto text-red-600 hover:text-red-700 text-sm underline"
                  >
                    {language === "ar" ? "حذف" : "Remove"}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t-2 border-tea-green">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{t("subtotal")}</span>
              <span className="text-2xl font-bold text-tea-green">
                {language === "ar" ? `${subtotal} ريال` : `${subtotal} SAR`}
              </span>
            </div>
          </div>

          {/* Checkout Form */}
          <div id="checkout-form" className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
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
                  <span className="ml-3 text-gray-900 dark:text-gray-100 font-medium">
                    {t("cashOnDelivery")}
                  </span>
                </label>
                
                <label className="flex items-center p-4 border-2 border-purple-500/30 rounded-lg cursor-pointer hover:bg-purple-500/5 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stcpay"
                    checked={paymentMethod === "stcpay"}
                    onChange={(e) => setPaymentMethod(e.target.value as "stcpay")}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-600"
                  />
                  <span className="ml-3 text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2">
                    {t("stcPayQR")}
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {language === "ar" ? "مباشر" : "Instant"}
                    </span>
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
                  <span className="ml-3 text-gray-900 dark:text-gray-100 font-medium">
                    {t("whatsappOrder")}
                  </span>
                </label>
              </div>
            </div>

            {paymentMethod === "stcpay" ? (
              // STC Pay QR Code Checkout
              <form onSubmit={handleSubmitOrder}>
                <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-2xl p-6 mb-6 border-2 border-purple-200 dark:border-purple-800">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                      {language === "ar" ? "الدفع عبر STC Pay" : "Pay with STC Pay"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {language === "ar" 
                        ? "امسح رمز QR بتطبيق STC Pay أو تطبيق البنك"
                        : "Scan QR code with STC Pay or your bank app"}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
                    <div className="relative w-full max-w-sm mx-auto aspect-square">
                      <Image
                        src="/images/stc-qr-code.jpg"
                        alt="STC Pay QR Code"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-sm font-semibold text-gray-700">
                        {language === "ar" ? "المبلغ المطلوب: " : "Amount: "}
                        <span className="text-2xl text-purple-600">{subtotal} {language === "ar" ? "ريال" : "SAR"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Instructions Toggle */}
                  <button
                    onClick={() => setShowStcInstructions(!showStcInstructions)}
                    className="w-full flex items-center justify-between p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <span className="font-semibold text-purple-800 dark:text-purple-200">
                      {language === "ar" ? "📱 كيفية مسح رمز QR؟" : "📱 How to scan the QR code?"}
                    </span>
                    <svg
                      className={`w-5 h-5 text-purple-600 dark:text-purple-300 transition-transform ${showStcInstructions ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Step-by-step Instructions */}
                  {showStcInstructions && (
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-purple-100 dark:border-purple-800">
                      {language === "ar" ? (
                        <div className="space-y-4 text-right" dir="rtl">
                          <h4 className="font-bold text-lg text-purple-700 dark:text-purple-300 mb-4">طريقة الدفع:</h4>
                          
                          <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">١</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">افتح تطبيق STC Pay</p>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">٢</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">ابحث عن "مسح رمز QR" أو "QR Scanner"</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">عادة تجده في الصفحة الرئيسية أو قائمة الخدمات</p>
                                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                  <p className="text-sm text-yellow-800 dark:text-yellow-200">💡 <strong>نصيحة:</strong> في STC Pay، ستجد أيقونة "QR scanner" في الشاشة الرئيسية</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">٣</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">امسح رمز QR أعلاه</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">وجّه كاميرا الهاتف نحو رمز QR</p>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">٤</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">أدخل المبلغ وأكمل الدفع</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">أدخل <strong className="text-purple-600">{subtotal} ريال</strong> واتبع التعليمات</p>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">بعد الدفع، أكمل الطلب أدناه</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">املأ بياناتك وأكمل الطلب حتى نتمكن من التوصيل</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>❓ لا تعرف أين تجد ماسح QR؟</strong><br/>
                              ابحث في تطبيق البنك عن: "مسح رمز" أو "QR" أو "مسح QR" أو "QR scanner"
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="font-bold text-lg text-purple-700 dark:text-purple-300 mb-4">Payment Steps:</h4>
                          
                          <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">Open STC Pay app</p>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">Find "QR Scanner" option</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Usually found on the home screen or services menu</p>
                                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                  <p className="text-sm text-yellow-800 dark:text-yellow-200">💡 <strong>Tip:</strong> In STC Pay, you'll find "QR scanner" icon on the main screen</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">Scan the QR code above</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Point your phone camera at the QR code</p>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">Enter amount and complete payment</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Enter <strong className="text-purple-600">{subtotal} SAR</strong> and follow instructions</p>
                              </div>
                            </div>

                            <div className="flex gap-4 items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-white mb-2">After payment, complete order below</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Fill in your details and complete the order for delivery</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>❓ Can't find QR scanner?</strong><br/>
                              Look in your bank app for: "Scan QR", "QR Scanner", or "QR Code" option
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Customer Information Form for STC Pay */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t("customerInformation")}
                  </h3>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t("fullName")} *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t("phoneNumber")} *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t("deliveryAddress")} *
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
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
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t("deliveryTime")} *
                      </label>
                      <select
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">{language === "ar" ? "اختر الوقت المفضل" : "Select preferred time"}</option>
                        <option value={t("deliveryTimeMorning")}>{t("deliveryTimeMorning")}</option>
                        <option value={t("deliveryTimeAfternoon")}>{t("deliveryTimeAfternoon")}</option>
                        <option value={t("deliveryTimeEvening")}>{t("deliveryTimeEvening")}</option>
                        <option value={t("deliveryTimeAnytime")}>{t("deliveryTimeAnytime")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t("deliveryNotes")}
                      </label>
                      <textarea
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        rows={2}
                        placeholder={t("deliveryNotesPlaceholder")}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-700 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                      {language === "ar" 
                        ? "📲 هل استلمت رسالة تأكيد الدفع من البنك؟"
                        : "📲 Did you receive payment confirmation SMS from your bank?"}
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      {language === "ar" 
                        ? "بعد مسح رمز QR والدفع، ستصلك رسالة نصية من البنك تؤكد التحويل. تأكد من استلامها قبل تأكيد الطلب."
                        : "After scanning the QR code and paying, you'll receive an SMS from your bank confirming the transfer. Make sure you received it before confirming the order."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? (language === "ar" ? "⏳ جاري المعالجة..." : "⏳ Processing...")
                      : (language === "ar" ? "✅ تأكيد الطلب (بعد الدفع)" : "✅ Confirm Order (After Payment)")}
                  </button>

                  <p className="text-sm text-center mt-3 text-yellow-600 dark:text-yellow-400 font-semibold">
                    ⚠️ {language === "ar" 
                      ? "تأكد من إتمام الدفع قبل تأكيد الطلب"
                      : "Make sure to complete payment before confirming order"}
                  </p>
                </div>
              </form>
            ) : paymentMethod === "whatsapp" ? (
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t("customerInformation")}
                </h3>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t("fullName")} *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {language === "ar" ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={language === "ar" ? "your@email.com" : "your@email.com"}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {language === "ar" ? "لتلقي تأكيد الطلب عبر البريد الإلكتروني" : "To receive order confirmation via email"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t("phoneNumber")} *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t("deliveryAddress")} *
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green text-gray-900 dark:text-white bg-white dark:bg-gray-800"
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
                      {t("deliveryTime")} *
                    </label>
                    <select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green text-deep-brown"
                    >
                      <option value="">{language === "ar" ? "اختر الوقت المفضل" : "Select preferred time"}</option>
                      <option value={t("deliveryTimeMorning")}>{t("deliveryTimeMorning")}</option>
                      <option value={t("deliveryTimeAfternoon")}>{t("deliveryTimeAfternoon")}</option>
                      <option value={t("deliveryTimeEvening")}>{t("deliveryTimeEvening")}</option>
                      <option value={t("deliveryTimeAnytime")}>{t("deliveryTimeAnytime")}</option>
                    </select>
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
                      className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green resize-none text-deep-brown"
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
