import { supabase } from "./supabaseClient";

interface NotificationSettings {
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  admin_whatsapp_number: string;
  low_stock_threshold: number;
  notify_on_new_order: boolean;
  notify_on_low_stock: boolean;
  notify_on_order_status_change: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  email_notifications: true,
  whatsapp_notifications: true,
  admin_whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  low_stock_threshold: 5,
  notify_on_new_order: true,
  notify_on_low_stock: true,
  notify_on_order_status_change: false,
};

// Get notification settings from localStorage (admin-only)
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  
  try {
    const saved = localStorage.getItem("admin_notification_settings");
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error("Error loading notification settings:", error);
  }
  
  return DEFAULT_SETTINGS;
}

// Save notification settings to localStorage
export function saveNotificationSettings(settings: NotificationSettings) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem("admin_notification_settings", JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving notification settings:", error);
  }
}

// Send WhatsApp notification for new order
export async function sendNewOrderWhatsAppNotification(order: any) {
  const settings = getNotificationSettings();
  
  if (!settings.whatsapp_notifications || !settings.notify_on_new_order) {
    return;
  }

  const phoneNumber = settings.admin_whatsapp_number;
  if (!phoneNumber) return;

  const message = `🔔 *New Order Alert!*

Order ID: ${order.order_id}
Customer: ${order.customer_name}
Phone: ${order.customer_phone}
Total: ${order.total} SAR
Payment: ${order.payment_method === "cod" ? "Cash on Delivery" : "WhatsApp"}

View details: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://lulatee.com'}/admin/orders/${order.id}

--
Lula Tea Admin`;

  try {
    const response = await fetch("/api/notifications/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, message }),
    });

    const data = await response.json();
    
    if (data.success && data.whatsappUrl) {
      // Auto-open WhatsApp (optional - can be disabled in settings)
      if (typeof window !== "undefined" && settings.notify_on_new_order) {
        window.open(data.whatsappUrl, "_blank");
      }
    }
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
  }
}

// Send email notification for new order
export async function sendNewOrderEmailNotification(order: any) {
  const settings = getNotificationSettings();
  
  if (!settings.email_notifications || !settings.notify_on_new_order) {
    return;
  }

  try {
    await fetch("/api/emails/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL,
        subject: `🔔 New Order: ${order.order_id}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${order.order_id}</p>
          <p><strong>Customer:</strong> ${order.customer_name}</p>
          <p><strong>Phone:</strong> ${order.customer_phone}</p>
          <p><strong>Total:</strong> ${order.total} SAR</p>
          <p><strong>Payment Method:</strong> ${order.payment_method === "cod" ? "Cash on Delivery" : "WhatsApp"}</p>
          <br>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://lulatee.com'}/admin/orders/${order.id}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order Details</a></p>
        `,
      }),
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}

// Check low stock and send notifications
export async function checkLowStockAndNotify() {
  const settings = getNotificationSettings();
  
  if (!settings.notify_on_low_stock) {
    return;
  }

  // This would check product inventory (to be implemented with product management)
  // For now, this is a placeholder
  console.log("Low stock check would run here with threshold:", settings.low_stock_threshold);
}
