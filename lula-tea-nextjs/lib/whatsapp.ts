export interface CartItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
  image: string;
}

export interface WhatsAppMessageOptions {
  items: CartItem[];
  subtotal: number;
  language: "en" | "ar";
  customerName?: string;
  deliveryAddress?: string;
  deliveryTime?: string;
  gpsCoordinates?: string;
}

export function buildWhatsAppMessage(options: WhatsAppMessageOptions): string {
  const { items, subtotal, language, customerName, deliveryAddress, deliveryTime, gpsCoordinates } = options;
  const currency = "SAR";
  
  if (language === "ar") {
    const itemsList = items
      .map((item) => `${item.nameAr} x${item.quantity}`)
      .join("\n");
    
    let message = `مرحباً! 👋\n\n`;
    if (customerName) message += `الاسم: ${customerName}\n\n`;
    
    message += `📦 *طلبي:*\n${itemsList}\n\n💰 *المجموع:* ${subtotal} ${currency}\n\n`;
    
    if (deliveryAddress) message += `📍 *عنوان التوصيل:*\n${deliveryAddress}\n\n`;
    if (gpsCoordinates) message += `🗺️ *الموقع:* ${gpsCoordinates}\n\n`;
    if (deliveryTime) message += `🕐 *وقت التوصيل المفضل:* ${deliveryTime}\n\n`;
    
    message += `شكراً! 🌟`;
    return message;
  }
  
  const itemsList = items
    .map((item) => `${item.name} x${item.quantity}`)
    .join("\n");
  
  let message = `Hi! 👋\n\n`;
  if (customerName) message += `Name: ${customerName}\n\n`;
  
  message += `📦 *My Order:*\n${itemsList}\n\n💰 *Total:* ${subtotal} ${currency}\n\n`;
  
  if (deliveryAddress) message += `📍 *Delivery Address:*\n${deliveryAddress}\n\n`;
  if (gpsCoordinates) message += `🗺️ *Location:* ${gpsCoordinates}\n\n`;
  if (deliveryTime) message += `🕐 *Preferred Delivery Time:* ${deliveryTime}\n\n`;
  
  message += `Thank you! 🌟`;
  return message;
}

export function getWhatsAppURL(message: string): string {
  const whatsappNumber = "966539666654";
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

export function openWhatsApp(options: WhatsAppMessageOptions) {
  const message = buildWhatsAppMessage(options);
  const url = getWhatsAppURL(message);
  window.open(url, "_blank");
}
