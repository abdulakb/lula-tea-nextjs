import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * WhatsApp Webhook Handler
 * This endpoint can be configured in WhatsApp Business API to receive incoming messages
 * and send automated responses based on order status
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook (WhatsApp sends verification request)
    const mode = request.nextUrl.searchParams.get("hub.mode");
    const token = request.nextUrl.searchParams.get("hub.verify_token");
    const challenge = request.nextUrl.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    }

    // Handle incoming messages
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // Customer's phone number
      const messageText = message.text?.body?.toLowerCase() || "";

      // Check if customer has recent orders
      const { data: recentOrders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_phone", from)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      let response = "";

      // Auto-respond based on message content
      if (messageText.includes("order") || messageText.includes("طلب")) {
        if (recentOrders && recentOrders.length > 0) {
          const order = recentOrders[0];
          const isArabic = messageText.includes("طلب");
          
          response = isArabic
            ? `مرحباً! 🌿\n\nطلبك #${order.order_id} في حالة: ${getStatusArabic(order.status)}\n\n${getStatusMessageArabic(order.status)}\n\nإذا كان لديك أي استفسار، نحن هنا للمساعدة! 💚`
            : `Hello! 🌿\n\nYour order #${order.order_id} status: ${order.status}\n\n${getStatusMessage(order.status)}\n\nIf you have any questions, we're here to help! 💚`;
        } else {
          response = "Hello! 🌿 It looks like you don't have any recent orders. Would you like to place a new order?\n\nمرحباً! 🌿 لا يوجد لديك طلبات حديثة. هل ترغب في طلب جديد؟\n\nVisit: https://lula-tea-nextjs.vercel.app";
        }
      } else if (messageText.includes("status") || messageText.includes("حالة")) {
        if (recentOrders && recentOrders.length > 0) {
          const order = recentOrders[0];
          response = `Order Status / حالة الطلب:\n\n#${order.order_id}\nStatus: ${order.status}\nحالة: ${getStatusArabic(order.status)}\n\n${getStatusMessage(order.status)}`;
        } else {
          response = "No recent orders found. / لا توجد طلبات حديثة.";
        }
      } else if (messageText.includes("track") || messageText.includes("تتبع")) {
        if (recentOrders && recentOrders.length > 0) {
          const order = recentOrders[0];
          response = `📍 Order Tracking / تتبع الطلب\n\nOrder ID: ${order.order_id}\nStatus: ${order.status}\nPlaced: ${new Date(order.created_at).toLocaleDateString()}\n\nWe'll notify you when your order status changes! 🚚`;
        }
      } else if (messageText.includes("help") || messageText.includes("مساعدة")) {
        response = `How can we help? / كيف يمكننا المساعدة؟\n\n📦 Type "order" for order status\n📍 Type "track" to track your order\n💬 Type "support" to talk to us\n\nOr visit: https://lula-tea-nextjs.vercel.app`;
      } else {
        // Default greeting
        response = `Welcome to Lula Tea! 🌿\n\nمرحباً بك في لولا تي!\n\nHow can we help you today?\n• Order status\n• New order\n• Support\n\nReply with what you need! 💚`;
      }

      // Send response via WhatsApp API
      if (process.env.WHATSAPP_API_TOKEN) {
        await sendWhatsAppMessage(from, response);
      }

      return NextResponse.json({ success: true, message: "Message processed" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Webhook verification
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// Helper functions
async function sendWhatsAppMessage(to: string, message: string) {
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
          to: to,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to send WhatsApp message:", await response.text());
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: "We've received your order and will confirm it shortly.",
    confirmed: "Your order is confirmed! We're preparing your tea with love.",
    processing: "Your tea is being carefully prepared and packaged.",
    shipped: "Your order is on its way to you! 🚚",
    delivered: "Your order has been delivered. Enjoy your tea! ☕",
    cancelled: "This order has been cancelled.",
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
    pending: "لقد استلمنا طلبك وسنقوم بتأكيده قريباً.",
    confirmed: "تم تأكيد طلبك! نحن نحضر الشاي بحب.",
    processing: "يتم تحضير وتعبئة الشاي بعناية.",
    shipped: "طلبك في الطريق إليك! 🚚",
    delivered: "تم توصيل طلبك. استمتع بالشاي! ☕",
    cancelled: "تم إلغاء هذا الطلب.",
  };
  return messages[status] || "تحديث حالة الطلب";
}
