import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * Update order status and notify customer via WhatsApp
 * POST /api/orders/update-status
 * Body: { orderId: string, status: string, adminPassword: string }
 */

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, adminPassword } = await request.json();

    // Verify admin password
    if (adminPassword !== "lulatea2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update order status
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("order_id", orderId)
      .select()
      .single();

    if (updateError || !order) {
      console.error("Error updating order:", updateError);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // Send WhatsApp notification to customer
    const notificationSent = await sendStatusNotification(order, status);

    return NextResponse.json({
      success: true,
      order,
      notificationSent
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function sendStatusNotification(order: any, status: string) {
  if (!process.env.WHATSAPP_API_TOKEN || !order.customer_phone) {
    return false;
  }

  const phone = order.customer_phone.replace(/\D/g, "");
  
  // Determine if customer prefers Arabic (based on previous interactions or default to bilingual)
  const bilingual = true; // Send both languages for best UX

  let message = "";

  if (bilingual) {
    message = `Hello ${order.customer_name}! 🌿\nمرحباً ${order.customer_name}!\n\n`;
    message += `Order Update / تحديث الطلب\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `📦 Order: ${order.order_id}\n`;
    message += `Status: ${status.toUpperCase()}\n`;
    message += `الحالة: ${getStatusArabic(status)}\n\n`;
    message += getStatusMessage(status) + "\n\n";
    message += getStatusMessageArabic(status) + "\n\n";
    
    if (status === "shipped") {
      message += `Expected delivery: Within 2-3 days\n`;
      message += `التوصيل المتوقع: خلال ٢-٣ أيام\n\n`;
    }
    
    if (status === "delivered") {
      message += `Enjoy your premium tea! ☕\n`;
      message += `استمتع بالشاي الفاخر! ☕\n\n`;
      message += `Rate your experience: https://lulatee.com\n`;
    }
    
    message += `\nQuestions? Reply to this message!\n`;
    message += `أسئلة؟ رد على هذه الرسالة!\n\n`;
    message += `💚 Lula Tea - Homemade with Love`;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
    return false;
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
