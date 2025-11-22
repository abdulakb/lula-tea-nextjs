export interface CartItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
  image: string;
}

export function buildWhatsAppMessage(items: CartItem[], subtotal: number, language: "en" | "ar"): string {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "SAR";
  
  if (language === "ar") {
    const itemsList = items
      .map((item) => `${item.nameAr} x${item.quantity}`)
      .join("\n");
    return `مرحباً! أود طلب:\n\n${itemsList}\n\nالمجموع: ${subtotal} ${currency}`;
  }
  
  const itemsList = items
    .map((item) => `${item.name} x${item.quantity}`)
    .join("\n");
  return `Hi! I'd like to order:\n\n${itemsList}\n\nTotal: ${subtotal} ${currency}`;
}

export function getWhatsAppURL(message: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/";
  const encodedMessage = encodeURIComponent(message);
  return `${baseUrl}?text=${encodedMessage}`;
}

export function openWhatsApp(items: CartItem[], subtotal: number, language: "en" | "ar") {
  const message = buildWhatsAppMessage(items, subtotal, language);
  const url = getWhatsAppURL(message);
  window.open(url, "_blank");
}
