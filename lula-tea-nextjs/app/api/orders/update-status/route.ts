import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * Update order status and notify customer via WhatsApp
 * POST /api/orders/update-status
 * Body: { orderId: string, status: string, adminPassword: string }
 */

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, adminPassword, sendNotification } = await request.json();

    // Verify admin password (optional if called from authenticated admin UI)
    if (adminPassword && adminPassword !== "lulatea2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Fetch the order by ID (UUID) or order_id (readable format)
    let order;
    
    // Try fetching by UUID first (orderId from admin UI)
    const { data: orderByUuid, error: uuidError } = await supabase
      .from("orders")
      .select()
      .eq("id", orderId)
      .single();

    if (orderByUuid) {
      order = orderByUuid;
    } else {
      // Try fetching by order_id (readable format like LT123...)
      const { data: orderByReadableId, error: readableError } = await supabase
        .from("orders")
        .select()
        .eq("order_id", orderId)
        .single();
      
      if (orderByReadableId) {
        order = orderByReadableId;
      }
    }

    if (!order) {
      console.error("Order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // Update local order object
    order.status = status;

    // Prepare WhatsApp notification if requested
    let notificationResult;
    if (sendNotification) {
      notificationResult = await sendStatusNotification(order, status);
    }

    return NextResponse.json({
      success: true,
      order,
      whatsappUrl: notificationResult?.whatsappUrl,
      phone: notificationResult?.phone,
      preview: getMessagePreview(status),
      notificationSent: notificationResult?.success || false,
      autoSent: notificationResult?.autoSent || false
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function getMessagePreview(status: string): string {
  const previews: Record<string, string> = {
    confirmed: "✅ تم تأكيد طلبك! نحن نحضر الشاي بحب ❤️",
    processing: "📦 يتم تحضير طلبك",
    shipped: "🚚 طلبك في الطريق إليك!",
    delivered: "🍵 بالعافية 🍵 + رابط تقييم ⭐",
    cancelled: "❌ تم إلغاء الطلب"
  };
  return previews[status] || "Order status update";
}

async function sendStatusNotification(order: any, status: string) {
  try {
    // Clean phone number and ensure it has Saudi country code
    let cleanPhone = order.customer_phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleanPhone.startsWith('966')) {
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '966' + cleanPhone.substring(1);
      } else {
        cleanPhone = '966' + cleanPhone;
      }
    }
    
    // Get customer's first name only
    const firstName = order.customer_name.split(' ')[0];
    
    // Detect language (default to English if not set)
    const isArabic = order.language === 'ar';
    
    let message = '';
    
    // Status-specific messages
    if (status === "confirmed") {
      message = isArabic
        ? `مرحباً ${firstName}! 🌿\n\n📦 رقم الطلب: ${order.order_id}\n\n✅ تم تأكيد طلبك!\n\nنحن نحضر الشاي بحب ❤️\n\nأي استفسار؟ رد على هذه الرسالة\n\n💚 لولة تي - مصنوع بحب`
        : `Hello ${firstName}! 🌿\n\n📦 Order: ${order.order_id}\n\n✅ Your order is confirmed!\n\nWe're preparing your tea with love ❤️\n\nAny questions? Reply to this message\n\n💚 Lula Tea - Homemade with Love`;
    } else if (status === "processing") {
      message = isArabic
        ? `مرحباً ${firstName}! 🌿\n\n📦 رقم الطلب: ${order.order_id}\n\n📦 يتم تحضير طلبك\n\nسنقوم بالتوصيل قريباً\n\nأي استفسار؟ رد على هذه الرسالة\n\n💚 لولة تي - مصنوع بحب`
        : `Hello ${firstName}! 🌿\n\n📦 Order: ${order.order_id}\n\n📦 Your order is being prepared\n\nWill be delivered soon\n\nAny questions? Reply to this message\n\n💚 Lula Tea - Homemade with Love`;
    } else if (status === "shipped") {
      message = isArabic
        ? `مرحباً ${firstName}! 🌿\n\n📦 رقم الطلب: ${order.order_id}\n\n🚚 طلبك في الطريق إليك!\n\nالتوصيل المتوقع: خلال ٢-٣ أيام\n\nأي استفسار؟ رد على هذه الرسالة\n\n💚 لولة تي - مصنوع بحب`
        : `Hello ${firstName}! 🌿\n\n📦 Order: ${order.order_id}\n\n🚚 Your order is on its way!\n\nExpected delivery: Within 2-3 days\n\nAny questions? Reply to this message\n\n💚 Lula Tea - Homemade with Love`;
    } else if (status === "delivered") {
      // Generate review link with first name
      const reviewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://lulatee.com'}/review?order=${encodeURIComponent(order.order_id)}&name=${encodeURIComponent(firstName)}`;
      
      message = isArabic
        ? `مرحباً ${firstName}!\nتم توصيل طلبك #${order.order_id}!\n\nبالعافية!\n\n---\n\nبعد ما تجرب الشاي، نحب نسمع رأيك!\n\nشاركنا تجربتك في دقيقة واحدة:\n${reviewUrl}\n\nرأيك يساعدنا نطور\n\nأي استفسار؟ رد على هذه الرسالة\n\nشكراً لثقتك بلولة تي\n\nلولة تي - مصنوع بحب`
        : `Hello ${firstName}!\nYour order #${order.order_id} has been delivered!\n\nEnjoy your tea!\n\n---\n\nOnce you've tried the tea, we'd love your feedback!\n\nShare your experience in 1 minute:\n${reviewUrl}\n\nYour feedback helps us improve\n\nAny questions? Reply to this message\n\nThank you for trusting Lula Tea\n\nLula Tea - Homemade with Love`;
    } else if (status === "cancelled") {
      message = isArabic
        ? `مرحباً ${firstName}! 🌿\n\n📦 رقم الطلب: ${order.order_id}\n\n❌ تم إلغاء الطلب\n\nنأسف لإلغاء طلبك\n\nأي استفسار؟ رد على هذه الرسالة\n\n💚 لولة تي - مصنوع بحب`
        : `Hello ${firstName}! 🌿\n\n📦 Order: ${order.order_id}\n\n❌ Order cancelled\n\nSorry for the cancellation\n\nAny questions? Reply to this message\n\n💚 Lula Tea - Homemade with Love`;
    }
    
    // Use wa.me link for fallback/manual sending
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    console.log(`📱 Sending WhatsApp notification to ${order.customer_name} (${cleanPhone})`);
    
    // Actually send via Twilio WhatsApp API
    try {
      const whatsappResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: `+${cleanPhone}`,
          message: message
        })
      });

      const whatsappResult = await whatsappResponse.json();
      
      if (whatsappResult.success) {
        console.log(`✅ WhatsApp sent successfully! SID: ${whatsappResult.twilioSid}`);
        return {
          success: true,
          whatsappUrl,
          phone: cleanPhone,
          twilioSid: whatsappResult.twilioSid,
          autoSent: true
        };
      } else {
        console.error(`❌ Twilio failed:`, whatsappResult.error);
        // Return URL as fallback for manual sending
        return {
          success: false,
          whatsappUrl,
          phone: cleanPhone,
          error: whatsappResult.error,
          autoSent: false
        };
      }
    } catch (twilioError) {
      console.error('❌ Failed to call Twilio API:', twilioError);
      // Return URL as fallback
      return {
        success: false,
        whatsappUrl,
        phone: cleanPhone,
        error: String(twilioError),
        autoSent: false
      };
    }
    
  } catch (error) {
    console.error("Failed to prepare WhatsApp notification:", error);
    return {
      success: false,
      error: String(error),
      autoSent: false
    };
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: "✅ We've received your order and will confirm it shortly.",
    confirmed: "🎉 Your order is confirmed! We're preparing your tea with love.",
    processing: "📦 Your tea is being carefully prepared and packaged.",
    shipped: "🚚 Your order is on its way to you!",
    delivered: "✨ Your order has been delivered!",
    cancelled: "❌ This order has been cancelled.",
  };
  return messages[status] || "Order status update";
}

function getStatusArabic(status: string): string {
  const statuses: Record<string, string> = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    processing: "قيد التحضير",
    shipped: "قيد التوصيل",
    delivered: "تم التوصيل",
    cancelled: "ملغى",
  };
  return statuses[status] || status;
}

function getStatusMessageArabic(status: string): string {
  const messages: Record<string, string> = {
    pending: "✅ لقد استلمنا طلبك وسنقوم بتأكيده قريباً.",
    confirmed: "🎉 تم تأكيد طلبك! نحن نحضر الشاي بحب.",
    processing: "📦 يتم تحضير وتعبئة الشاي بعناية.",
    shipped: "🚚 طلبك في الطريق إليك!",
    delivered: "✨ تم توصيل طلبك!",
    cancelled: "❌ تم إلغاء هذا الطلب.",
  };
  return messages[status] || "تحديث حالة الطلب";
}
