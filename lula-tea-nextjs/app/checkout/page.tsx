"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAnalytics } from "@/context/AnalyticsContext";
import { useToast } from "@/context/ToastContext";
import { openWhatsApp } from "@/lib/whatsapp";
import { trackCheckoutStarted, trackCheckoutAbandoned } from "@/lib/appInsights";
import CheckoutProgress from "../components/CheckoutProgress";

const ThemeToggle = dynamic(() => import("@/app/components/ThemeToggle"), {
  ssr: false,
});

export default function CheckoutPage() {
  const { t, language } = useLanguage();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { trackEvent } = useAnalytics();
  const { showToast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Track checkout start
  useEffect(() => {
    // Wait for cart to load - check both undefined and null
    if (!items || !Array.isArray(items)) {
      return;
    }

    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    
    setIsLoading(false);

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
    
    // Track in Azure App Insights
    trackCheckoutStarted(subtotal, items.length);

    // Track abandonment when user leaves
    const handleBeforeUnload = () => {
      trackCheckoutAbandoned('page_exit', 'checkout_info', subtotal);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Auto-scroll to form on mobile to avoid confusion
    // Wait for page to fully load before scrolling
    const timer = setTimeout(() => {
      const formSection = document.getElementById("checkout-form");
      if (formSection && window.innerWidth < 1024) {
        // Only auto-scroll on mobile/tablet (< 1024px)
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [items, subtotal, router, trackEvent]);
  
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [pickupLocation, setPickupLocation] = useState<"riyadh" | "jeddah" | "">(""); 
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stcpay" | "whatsapp">("cod");
  const [showStcInstructions, setShowStcInstructions] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Array<{name: string, address: string, phone: string}>>([]);
  const [gpsCoordinates, setGpsCoordinates] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
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

  // Calculate estimated delivery date
  const getEstimatedDeliveryDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // If order placed before 2 PM, next day delivery
    // Otherwise, delivery in 2 days
    const currentHour = today.getHours();
    const deliveryDate = currentHour < 14 ? tomorrow : new Date(today.setDate(today.getDate() + 2));
    
    return deliveryDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDeliveryTimeRemaining = () => {
    const now = new Date();
    const cutoffTime = new Date();
    cutoffTime.setHours(14, 0, 0, 0); // 2 PM cutoff
    
    if (now < cutoffTime) {
      const diff = cutoffTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return { hours, minutes, nextDay: true };
    }
    return { hours: 0, minutes: 0, nextDay: false };
  };

  // Major city boundaries (approximate)
  const RIYADH_BOUNDS = {
    minLat: 24.4, maxLat: 25.0,
    minLng: 46.3, maxLng: 47.0
  };
  const JEDDAH_BOUNDS = {
    minLat: 21.3, maxLat: 21.8,
    minLng: 39.0, maxLng: 39.4
  };
  // King Abdulaziz International Airport latitude (approximately 21.68)
  // Orders north of this (heading to Madinah) have higher delivery fee
  const JEDDAH_AIRPORT_LAT = 21.68;

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

  // Check if location is in Jeddah northern area (after airport heading to Madinah)
  const isJeddahNorthernArea = (lat: number, lng: number): boolean => {
    // First check if in Jeddah bounds
    if (lat >= JEDDAH_BOUNDS.minLat && lat <= JEDDAH_BOUNDS.maxLat &&
        lng >= JEDDAH_BOUNDS.minLng && lng <= JEDDAH_BOUNDS.maxLng) {
      // Check if north of the airport
      return lat > JEDDAH_AIRPORT_LAT;
    }
    return false;
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
    
    // Only free delivery if within 20km from warehouse
    // 25 SAR for Jeddah northern area (after airport heading to Madinah)
    // 15 SAR delivery fee for all others in Riyadh/Jeddah
    const nearWarehouse = distance <= FREE_DELIVERY_RADIUS_KM;
    const inMajorCity = !!city; // Just check if in Riyadh or Jeddah for delivery eligibility
    const isNorthernJeddah = isJeddahNorthernArea(latitude, longitude);
    
    const qualifies = nearWarehouse;
    setQualifiesForFreeDelivery(qualifies);
    
    return { qualifies, distance, totalPacks, city, nearWarehouse, inMajorCity, isNorthernJeddah };
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
          
          // Add delivery info to notes
          if (eligibility.nearWarehouse) {
            notesText += `\n✅ FREE DELIVERY (Within ${eligibility.distance.toFixed(1)}km from warehouse)`;
          } else if (eligibility.isNorthernJeddah) {
            notesText += `\n💰 Delivery Fee: 25 SAR (Jeddah - Northern Area)`;
          } else if (eligibility.city) {
            notesText += `\n💰 Delivery Fee: 15 SAR`;
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
    setFieldErrors({});
    
    // Validate required fields with specific error messages
    const errors: {[key: string]: string} = {};
    
    if (!customerName.trim()) {
      errors.customerName = language === "ar" ? "الاسم مطلوب" : "Name is required";
    } else if (customerName.trim().length < 3) {
      errors.customerName = language === "ar" ? "الاسم يجب أن يكون 3 أحرف على الأقل" : "Name must be at least 3 characters";
    }
    
    if (!customerPhone.trim()) {
      errors.customerPhone = language === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
    } else if (!/^[0-9+\s-]{10,}$/.test(customerPhone.trim())) {
      errors.customerPhone = language === "ar" ? "رقم هاتف غير صالح" : "Invalid phone number";
    }
    
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errors.customerEmail = language === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address";
    }
    
    // Validate based on delivery method
    if (deliveryMethod === "pickup") {
      // For pickup: only validate pickup location
      if (!pickupLocation) {
        errors.pickupLocation = language === "ar" ? "يرجى اختيار موقع الاستلام" : "Please select a pickup location";
        showToast(
          language === "ar" ? "يرجى اختيار موقع الاستلام" : "Please select a pickup location",
          "error"
        );
      }
    } else {
      // For delivery: validate address and location
      if (!deliveryAddress.trim()) {
        errors.deliveryAddress = language === "ar" ? "العنوان مطلوب" : "Address is required";
      } else if (deliveryAddress.trim().length < 10) {
        errors.deliveryAddress = language === "ar" ? "يرجى إدخال عنوان مفصل" : "Please enter a detailed address";
      }
      
      if (!deliveryTime) {
        errors.deliveryTime = language === "ar" ? "وقت التوصيل مطلوب" : "Delivery time is required";
      }

      // Validate delivery city - only Riyadh and Jeddah allowed
      if (!deliveryCity || (deliveryCity !== "Riyadh" && deliveryCity !== "Jeddah")) {
        errors.deliveryAddress = language === "ar" 
          ? "عذراً، نوصل حالياً فقط في الرياض وجدة. يرجى مشاركة موقعك للتحقق من المنطقة."
          : "Sorry, we currently deliver only in Riyadh and Jeddah. Please share your location to verify your area.";
        showToast(
          language === "ar" 
            ? "التوصيل متاح فقط في الرياض وجدة 📍" 
            : "Delivery available only in Riyadh and Jeddah 📍",
          "error"
        );
      }
    }
    if (!deliveryCity || (deliveryCity !== "Riyadh" && deliveryCity !== "Jeddah")) {
      errors.deliveryAddress = language === "ar" 
        ? "عذراً، نوصل حالياً فقط في الرياض وجدة. يرجى مشاركة موقعك للتحقق من المنطقة."
        : "Sorry, we currently deliver only in Riyadh and Jeddah. Please share your location to verify your area.";
      showToast(
        language === "ar" 
          ? "التوصيل متاح فقط في الرياض وجدة 📍" 
          : "Delivery available only in Riyadh and Jeddah 📍",
        "error"
      );
    }

    // Validate transaction reference for STC Pay
    if (paymentMethod === "stcpay" && !transactionReference.trim()) {
      errors.transactionReference = language === "ar" ? "رقم المعاملة مطلوب" : "Transaction reference required";
    } else if (paymentMethod === "stcpay" && transactionReference.trim().length < 4) {
      errors.transactionReference = language === "ar" ? "رقم المعاملة غير صالح" : "Invalid transaction reference";
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(language === "ar" ? "يرجى تصحيح الأخطاء أدناه" : "Please correct the errors below");
      showToast(
        language === "ar" ? "يرجى ملء جميع الحقول المطلوبة بشكل صحيح" : "Please fill all required fields correctly",
        "error"
      );
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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

      // Calculate delivery fee: Free for pickup or if near warehouse (within 20km)
      // 25 SAR for Jeddah northern area (after airport heading to Madinah)
      // 15 SAR for standard Riyadh/Jeddah
      let deliveryFee = 0;
      if (deliveryMethod !== "pickup") {
        if (distanceFromWarehouse !== null && distanceFromWarehouse <= FREE_DELIVERY_RADIUS_KM) {
          deliveryFee = 0; // Free delivery within 20km from warehouse
        } else if (gpsCoordinates) {
          const coords = gpsCoordinates.split(',');
          if (coords.length === 2) {
            const lat = parseFloat(coords[0]);
            const lng = parseFloat(coords[1]);
            if (isJeddahNorthernArea(lat, lng)) {
              deliveryFee = 25; // Higher fee for Jeddah northern area
            } else {
              deliveryFee = 15; // Standard fee
            }
          } else {
            deliveryFee = 15; // Default to standard fee if coordinates unclear
          }
        } else {
          deliveryFee = 15; // Default to standard fee if no GPS
        }
      }
      const totalAmount = subtotal + deliveryFee;

      // Prepare pickup location string
      const pickupLocationText = pickupLocation === "riyadh" 
        ? "Lula Lab Mursalat, Riyadh"
        : pickupLocation === "jeddah"
        ? "Lula Lab AL-Hamrah, Jeddah"
        : "";

      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress: deliveryMethod === "pickup" ? pickupLocationText : deliveryAddress,
        buildingNumber: deliveryMethod === "pickup" ? "" : buildingNumber,
        deliveryNotes: deliveryMethod === "pickup"
          ? `PICKUP ORDER - Location: ${pickupLocationText}\nContact via WhatsApp for exact location.${paymentMethod === "stcpay" ? `\n\n💳 Transaction Ref: ${transactionReference}` : ''}${isGift && giftMessage ? `\n\n🎁 Gift Message: ${giftMessage}` : ''}`
          : paymentMethod === "stcpay" 
            ? `${deliveryNotes}\n\n💳 Transaction Ref: ${transactionReference}${isGift && giftMessage ? `\n\n🎁 Gift Message: ${giftMessage}` : ''}`
            : `${deliveryNotes}${isGift && giftMessage ? `\n\n🎁 Gift Message: ${giftMessage}` : ''}`,
        deliveryMethod,
        pickupLocation: deliveryMethod === "pickup" ? pickupLocationText : undefined,
        deliveryTime,
        gpsCoordinates,
        deliveryCity,
        items: orderItems,
        subtotal,
        deliveryFee,
        total: totalAmount,
        paymentMethod,
        transactionReference: paymentMethod === "stcpay" ? transactionReference : undefined,
        language,
        qualifiesForFreeDelivery: deliveryFee === 0,
        isGift,
        giftMessage: isGift ? giftMessage : undefined,
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

  if (isLoading) {
    return (
      <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-warm-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </main>
    );
  }

  // Safety check - should not happen but prevents crashes
  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-warm-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-warm-cream dark:bg-gray-900 dark-transition">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto">
        <CheckoutProgress currentStep={2} />
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t("checkout")}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">{t("checkoutDescription")}</p>
        </div>

        {/* Delivery Method Selection */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {language === "ar" ? "طريقة الاستلام" : "Fulfillment Method"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              deliveryMethod === "delivery" 
                ? "border-tea-green bg-tea-green/5" 
                : "border-gray-300 dark:border-gray-600 hover:border-tea-green/50"
            }`}>
              <input
                type="radio"
                name="deliveryMethod"
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={(e) => setDeliveryMethod(e.target.value as "delivery")}
                className="w-4 h-4 text-tea-green focus:ring-tea-green"
              />
              <span className="ml-3 flex-1">
                <span className="block font-semibold text-gray-900 dark:text-white">
                  🚚 {language === "ar" ? "التوصيل" : "Delivery"}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {language === "ar" ? "توصيل لباب منزلك" : "Deliver to your door"}
                </span>
              </span>
            </label>
            
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              deliveryMethod === "pickup" 
                ? "border-tea-green bg-tea-green/5" 
                : "border-gray-300 dark:border-gray-600 hover:border-tea-green/50"
            }`}>
              <input
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={(e) => setDeliveryMethod(e.target.value as "pickup")}
                className="w-4 h-4 text-tea-green focus:ring-tea-green"
              />
              <span className="ml-3 flex-1">
                <span className="block font-semibold text-gray-900 dark:text-white">
                  📦 {language === "ar" ? "الاستلام" : "Pickup"}
                </span>
                <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  {language === "ar" ? "مجاناً - بدون رسوم" : "FREE - No charge"}
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Pickup Location Selection */}
        {deliveryMethod === "pickup" && (
          <div className="mb-8 bg-gradient-to-br from-green-50 to-tea-green/10 dark:from-green-900/20 dark:to-tea-green/10 rounded-3xl shadow-xl p-6 border-2 border-green-200 dark:border-green-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {language === "ar" ? "اختر موقع الاستلام" : "Select Pickup Location"}
            </h3>
            <div className="space-y-3 mb-4">
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                pickupLocation === "riyadh" 
                  ? "border-tea-green bg-white dark:bg-gray-800" 
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-tea-green/50"
              }`}>
                <input
                  type="radio"
                  name="pickupLocation"
                  value="riyadh"
                  checked={pickupLocation === "riyadh"}
                  onChange={(e) => setPickupLocation(e.target.value as "riyadh")}
                  className="w-4 h-4 text-tea-green focus:ring-tea-green mt-1"
                />
                <span className="ml-3 flex-1">
                  <span className="block font-semibold text-gray-900 dark:text-white">
                    📍 Lula Lab Mursalat, Riyadh
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "ar" ? "المرسلات، الرياض" : "Mursalat, Riyadh"}
                  </span>
                </span>
              </label>
              
              <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                pickupLocation === "jeddah" 
                  ? "border-tea-green bg-white dark:bg-gray-800" 
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-tea-green/50"
              }`}>
                <input
                  type="radio"
                  name="pickupLocation"
                  value="jeddah"
                  checked={pickupLocation === "jeddah"}
                  onChange={(e) => setPickupLocation(e.target.value as "jeddah")}
                  className="w-4 h-4 text-tea-green focus:ring-tea-green mt-1"
                />
                <span className="ml-3 flex-1">
                  <span className="block font-semibold text-gray-900 dark:text-white">
                    📍 Lula Lab AL-Hamrah, Jeddah
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "ar" ? "الحمراء، جدة" : "AL-Hamrah, Jeddah"}
                  </span>
                </span>
              </label>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                <span className="text-lg">💬</span>
                <span>
                  {language === "ar" 
                    ? "للحصول على الموقع الدقيق على خرائط جوجل، يرجى التواصل معنا عبر واتساب"
                    : "For the exact Google Maps location, please contact us on WhatsApp"}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Location Required Notice - Before location shared (only for delivery) */}
        {deliveryMethod === "delivery" && distanceFromWarehouse === null && (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl">📍</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  {language === "ar" ? "شارك موقعك للمتابعة" : "Share Your Location to Continue"}
                </h3>
                <p className="text-white/90">
                  {language === "ar" 
                    ? "نحتاج موقعك للتحقق من أننا نوصل إلى منطقتك"
                    : "We need your location to verify we deliver to your area"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Eligibility Result - After location shared (only for delivery) */}
        {deliveryMethod === "delivery" && distanceFromWarehouse !== null && (
          <>
            {!deliveryCity ? (
              <div className="mb-8 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🚫</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                      {language === "ar" ? "عذراً، لا نوصل إلى منطقتك حالياً" : "Sorry, we don't deliver to your area yet"}
                    </h3>
                    <p className="text-red-700 dark:text-red-300">
                      {language === "ar" 
                        ? "نوصل حالياً فقط في الرياض وجدة. نعمل على التوسع قريباً! 🚀"
                        : "We currently deliver only in Riyadh and Jeddah. We're expanding soon! 🚀"}
                    </p>
                  </div>
                </div>
              </div>
            ) : qualifiesForFreeDelivery ? (
              <div className="mb-8 bg-green-100 border-2 border-green-500 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">✅</span>
                  <div>
                    <p className="text-xl font-bold text-green-800">
                      {language === "ar" 
                        ? `موقعك في ${deliveryCity} - توصيل مجاني!` 
                        : `Your location in ${deliveryCity} - FREE delivery!`}
                    </p>
                    <p className="text-green-700 text-sm">
                      {language === "ar"
                        ? `موقعك على بُعد ${distanceFromWarehouse.toFixed(1)} كم من المستودع`
                        : `You're ${distanceFromWarehouse.toFixed(1)}km from our warehouse`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🚚</span>
                  <div>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                      {(() => {
                        const coords = gpsCoordinates.split(',');
                        const isNorthern = coords.length === 2 && isJeddahNorthernArea(parseFloat(coords[0]), parseFloat(coords[1]));
                        const fee = isNorthern ? 25 : 15;
                        return language === "ar" 
                          ? `موقعك في ${deliveryCity} - رسوم التوصيل: ${fee} ريال` 
                          : `Your location in ${deliveryCity} - Delivery Fee: ${fee} SAR`;
                      })()}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      {language === "ar"
                        ? "سيتم إضافة رسوم التوصيل إلى إجمالي طلبك"
                        : "Delivery fee will be added to your order total"}
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
            {items?.map((item) => (
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
            <div className="space-y-3 pt-4 border-t-2 border-tea-brown/20">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{t("subtotal")}</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === "ar" ? `${subtotal} ريال` : `${subtotal} SAR`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === "ar" ? "رسوم التوصيل" : "Delivery Fee"}
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {deliveryMethod === "pickup" ? (
                    <span className="text-green-600">{language === "ar" ? "مجاني" : "FREE"}</span>
                  ) : (distanceFromWarehouse !== null && deliveryCity && distanceFromWarehouse <= FREE_DELIVERY_RADIUS_KM) ? (
                    <span className="text-green-600">{language === "ar" ? "مجاني" : "FREE"}</span>
                  ) : distanceFromWarehouse !== null && deliveryCity ? (
                    (() => {
                      const coords = gpsCoordinates.split(',');
                      const isNorthern = coords.length === 2 && isJeddahNorthernArea(parseFloat(coords[0]), parseFloat(coords[1]));
                      const fee = isNorthern ? 25 : 15;
                      return language === "ar" ? `${fee} ريال` : `${fee} SAR`;
                    })()
                  ) : (
                    <span className="text-gray-500">{language === "ar" ? "سيتم الحساب" : "TBD"}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-tea-green">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{language === "ar" ? "الإجمالي" : "Total"}</span>
                <span className="text-2xl font-bold text-tea-green">
                  {(() => {
                    let deliveryFee = 0;
                    if (deliveryMethod !== "pickup") {
                      if (distanceFromWarehouse !== null && deliveryCity && distanceFromWarehouse <= FREE_DELIVERY_RADIUS_KM) {
                        deliveryFee = 0;
                      } else if (distanceFromWarehouse !== null && deliveryCity) {
                        const coords = gpsCoordinates.split(',');
                        const isNorthern = coords.length === 2 && isJeddahNorthernArea(parseFloat(coords[0]), parseFloat(coords[1]));
                        deliveryFee = isNorthern ? 25 : 15;
                      }
                    }
                    const total = subtotal + deliveryFee;
                    return language === "ar" ? `${total} ريال` : `${total} SAR`;
                  })()}
                </span>
              </div>
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

                  {/* Mobile: Download QR Button */}
                  <div className="md:hidden mb-4">
                    <a
                      href="/images/stc-qr-code.jpg"
                      download="stc-pay-qr-code.jpg"
                      className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-xl font-semibold text-center shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all"
                    >
                      {language === "ar" ? "📥 حفظ رمز QR للمسح من جهاز آخر" : "📥 Download QR Code to scan from another device"}
                    </a>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                      {language === "ar" 
                        ? "احفظ الصورة وافتحها على جهاز آخر للمسح"
                        : "Save the QR image and open it on another device to scan"}
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
                        <span className="text-2xl text-purple-600">
                          {(() => {
                            let deliveryFee = 0;
                            if (deliveryMethod !== "pickup") {
                              if (distanceFromWarehouse !== null && deliveryCity && distanceFromWarehouse <= FREE_DELIVERY_RADIUS_KM) {
                                deliveryFee = 0;
                              } else if (distanceFromWarehouse !== null && deliveryCity) {
                                const coords = gpsCoordinates.split(',');
                                const isNorthern = coords.length === 2 && isJeddahNorthernArea(parseFloat(coords[0]), parseFloat(coords[1]));
                                deliveryFee = isNorthern ? 25 : 15;
                              }
                            }
                            const total = subtotal + deliveryFee;
                            return `${total} ${language === "ar" ? "ريال" : "SAR"}`;
                          })()}
                        </span>
                      </p>
                      {deliveryMethod === "delivery" && distanceFromWarehouse !== null && deliveryCity && distanceFromWarehouse > FREE_DELIVERY_RADIUS_KM && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const coords = gpsCoordinates.split(',');
                            const isNorthern = coords.length === 2 && isJeddahNorthernArea(parseFloat(coords[0]), parseFloat(coords[1]));
                            const fee = isNorthern ? 25 : 15;
                            return language === "ar" ? `(${subtotal} ريال + ${fee} ريال توصيل)` : `(${subtotal} SAR + ${fee} SAR delivery)`;
                          })()}
                        </p>
                      )}
                    </div>
                    
                    {/* Desktop: Download option */}
                    <div className="hidden md:block mt-4">
                      <a
                        href="/images/stc-qr-code.jpg"
                        download="stc-pay-qr-code.jpg"
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {language === "ar" ? "تحميل رمز QR" : "Download QR Code"}
                      </a>
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
                                <p className="text-sm text-gray-600 dark:text-gray-300">أدخل <strong className="text-purple-600">
                                  {(() => {
                                    let deliveryFee = 0;
                                    if (deliveryMethod !== "pickup") {
                                      if (distanceFromWarehouse !== null && deliveryCity && distanceFromWarehouse <= FREE_DELIVERY_RADIUS_KM) {
                                        deliveryFee = 0;
                                      } else if (distanceFromWarehouse !== null && deliveryCity) {
                                        const coords = gpsCoordinates.split(',');
                                        const isNorthern = coords.length === 2 && isJeddahNorthernArea(parseFloat(coords[0]), parseFloat(coords[1]));
                                        deliveryFee = isNorthern ? 25 : 15;
                                      }
                                    }
                                    return `${subtotal + deliveryFee} ريال`;
                                  })()}
                                </strong> واتبع التعليمات</p>
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
                                <p className="text-sm text-gray-600 dark:text-gray-300">Enter <strong className="text-purple-600">
                                  {(() => {
                                    let deliveryFee = 0;
                                    if (deliveryMethod !== "pickup") {
                                      if (distanceFromWarehouse !== null && deliveryCity && distanceFromWarehouse <= FREE_DELIVERY_RADIUS_KM) {
                                        deliveryFee = 0;
                                      } else if (distanceFromWarehouse !== null && deliveryCity) {
                                        const coords = gpsCoordinates.split(',');
                                        const isNorthern = coords.length === 2 && isJeddahNorthernArea(parseFloat(coords[0]), parseFloat(coords[1]));
                                        deliveryFee = isNorthern ? 25 : 15;
                                      }
                                    }
                                    return `${subtotal + deliveryFee} SAR`;
                                  })()}
                                </strong> and follow instructions</p>
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
                  {/* Estimated Delivery Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-gradient-to-r from-tea-green/10 to-accent-gold/10 border-2 border-tea-green/30 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-3xl"
                        >
                          📦
                        </motion.div>
                        <div>
                          <p className="text-sm text-tea-brown/70 font-medium">
                            {language === "ar" ? "التوصيل المتوقع" : "Estimated Delivery"}
                          </p>
                          <p className="text-lg font-bold text-deep-brown">
                            {getEstimatedDeliveryDate()}
                          </p>
                        </div>
                      </div>
                      {(() => {
                        const timeRemaining = getDeliveryTimeRemaining();
                        return timeRemaining.nextDay ? (
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {language === "ar" 
                              ? `اطلب خلال ${timeRemaining.hours}س ${timeRemaining.minutes}د للتوصيل غداً!`
                              : `Order in ${timeRemaining.hours}h ${timeRemaining.minutes}m for next-day delivery!`}
                          </motion.div>
                        ) : (
                          <div className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            {language === "ar" ? "التوصيل خلال يومين" : "2-day delivery"}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>

                  {/* Trust Signals */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 flex flex-wrap items-center justify-center gap-4 p-4 bg-white/50 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-sm text-tea-brown">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{language === "ar" ? "دفع آمن ومضمون" : "Secure Payment"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-tea-brown">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                      <span>{language === "ar" ? "توصيل سريع" : "Fast Delivery"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-tea-brown">
                      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{language === "ar" ? "ضمان الجودة" : "Quality Guaranteed"}</span>
                    </div>
                  </motion.div>

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
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (fieldErrors.customerName) {
                            const newErrors = {...fieldErrors};
                            delete newErrors.customerName;
                            setFieldErrors(newErrors);
                          }
                        }}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                          fieldErrors.customerName 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                        }`}
                      />
                      {fieldErrors.customerName && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldErrors.customerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t("phoneNumber")} *
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          if (fieldErrors.customerPhone) {
                            const newErrors = {...fieldErrors};
                            delete newErrors.customerPhone;
                            setFieldErrors(newErrors);
                          }
                        }}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                          fieldErrors.customerPhone 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                        }`}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                      {fieldErrors.customerPhone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldErrors.customerPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t("deliveryAddress")} *
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => {
                          setDeliveryAddress(e.target.value);
                          if (fieldErrors.deliveryAddress) {
                            const newErrors = {...fieldErrors};
                            delete newErrors.deliveryAddress;
                            setFieldErrors(newErrors);
                          }
                        }}
                        required
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                          fieldErrors.deliveryAddress 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                        }`}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                      {fieldErrors.deliveryAddress && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldErrors.deliveryAddress}
                        </p>
                      )}
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
                        onChange={(e) => {
                          setDeliveryTime(e.target.value);
                          if (fieldErrors.deliveryTime) {
                            const newErrors = {...fieldErrors};
                            delete newErrors.deliveryTime;
                            setFieldErrors(newErrors);
                          }
                        }}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-base ${
                          fieldErrors.deliveryTime 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                        }`}
                      >
                        <option value="">{language === "ar" ? "اختر الوقت المفضل" : "Select preferred time"}</option>
                        <option value={t("deliveryTimeMorning")}>{t("deliveryTimeMorning")}</option>
                        <option value={t("deliveryTimeAfternoon")}>{t("deliveryTimeAfternoon")}</option>
                        <option value={t("deliveryTimeEvening")}>{t("deliveryTimeEvening")}</option>
                        <option value={t("deliveryTimeAnytime")}>{t("deliveryTimeAnytime")}</option>
                      </select>
                      {fieldErrors.deliveryTime && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {fieldErrors.deliveryTime}
                        </p>
                      )}
                    </div>

                    {/* Gift Message Option */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-2 border-tea-green/20 rounded-xl p-4 bg-tea-green/5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          id="isGift"
                          checked={isGift}
                          onChange={(e) => setIsGift(e.target.checked)}
                          className="w-4 h-4 text-tea-green border-gray-300 rounded focus:ring-tea-green"
                        />
                        <label htmlFor="isGift" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer flex items-center gap-2">
                          <span className="text-xl">🎁</span>
                          {language === "ar" ? "هذا الطلب هدية" : "This order is a gift"}
                        </label>
                      </div>
                      
                      {isGift && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {language === "ar" ? "رسالة الهدية (اختياري)" : "Gift Message (Optional)"}
                          </label>
                          <textarea
                            value={giftMessage}
                            onChange={(e) => setGiftMessage(e.target.value)}
                            rows={3}
                            maxLength={200}
                            placeholder={language === "ar" 
                              ? "أضف رسالة شخصية للمستلم... (مثال: عيد ميلاد سعيد!)" 
                              : "Add a personal message for the recipient... (e.g., Happy Birthday!)"}
                            className="w-full px-4 py-3 border border-tea-green/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            dir={language === "ar" ? "rtl" : "ltr"}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {language === "ar" 
                              ? `${giftMessage.length}/200 حرف`
                              : `${giftMessage.length}/200 characters`}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>

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

                  {/* Transaction Reference Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {language === "ar" 
                        ? "رقم المعاملة / رمز التحويل *"
                        : "Transaction Reference / Transfer Code *"}
                    </label>
                    <input
                      type="text"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      required
                      placeholder={language === "ar" 
                        ? "أدخل رقم المعاملة من رسالة البنك"
                        : "Enter transaction reference from bank SMS"}
                      className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-lg"
                      dir="ltr"
                    />
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>💡 {language === "ar" ? "مثال" : "Example"}:</strong><br/>
                        {language === "ar" 
                          ? "في رسالة البنك، ابحث عن:\n• رقم المعاملة\n• رمز التحويل\n• Transaction ID\n• Reference Number"
                          : "In your bank SMS, look for:\n• Transaction ID\n• Transfer Code\n• Reference Number\n• Any unique code/number"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span>{language === "ar" ? "جاري المعالجة..." : "Processing..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === "ar" ? "✅ تأكيد الطلب (بعد الدفع)" : "✅ Confirm Order (After Payment)"}</span>
                      </>
                    )}
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

                  {/* Building Number Field */}
                  <div>
                    <label className="block text-sm font-medium text-deep-brown mb-2">
                      {language === "ar" ? "رقم المبنى" : "Building Number"}
                    </label>
                    <input
                      type="text"
                      value={buildingNumber}
                      onChange={(e) => setBuildingNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      placeholder={language === "ar" ? "مثال: 1234" : "e.g., 1234"}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {language === "ar" ? "يساعد السائق في العثور على موقعك بسهولة" : "Helps the driver find your location easily"}
                    </p>
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
