interface OrderEmailData {
  orderId: string;
  customerName: string;
  items: Array<{
    name: string;
    nameAr: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  language: "en" | "ar";
}

export function generateOrderConfirmationEmail(data: OrderEmailData) {
  const isArabic = data.language === "ar";
  
  const itemsList = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${isArabic ? item.nameAr : item.name}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: ${isArabic ? 'left' : 'right'};">
            ${item.price * item.quantity} ${isArabic ? "ريال" : "SAR"}
          </td>
        </tr>`
    )
    .join("");

  const subject = isArabic
    ? `تأكيد طلبك - ${data.orderId}`
    : `Order Confirmation - ${data.orderId}`;

  const html = `
<!DOCTYPE html>
<html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${isArabic ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f1e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f1e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7a9b76 0%, #6b4423 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                ${isArabic ? "لولا تي" : "Lula Tea"}
              </h1>
              <p style="color: #f5f1e8; margin: 8px 0 0 0; font-size: 14px;">
                ${isArabic ? "محضّر بحب في المنزل" : "Homemade with Love"}
              </p>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #7a9b76; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style="color: #4a3728; margin: 0 0 12px 0; font-size: 24px;">
                ${isArabic ? "تم تأكيد طلبك!" : "Order Confirmed!"}
              </h2>
              <p style="color: #6b4423; margin: 0; font-size: 16px;">
                ${isArabic ? "شكراً لك" : "Thank you"}, ${data.customerName}
              </p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f5f1e8; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; color: #6b4423; font-size: 14px;">
                  ${isArabic ? "رقم الطلب" : "Order Number"}
                </p>
                <p style="margin: 0; color: #4a3728; font-size: 20px; font-weight: bold;">
                  ${data.orderId}
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #7a9b76;">
                    <th style="padding: 12px; text-align: ${isArabic ? 'right' : 'left'}; color: #ffffff; font-weight: 600;">
                      ${isArabic ? "المنتج" : "Item"}
                    </th>
                    <th style="padding: 12px; text-align: center; color: #ffffff; font-weight: 600;">
                      ${isArabic ? "الكمية" : "Qty"}
                    </th>
                    <th style="padding: 12px; text-align: ${isArabic ? 'left' : 'right'}; color: #ffffff; font-weight: 600;">
                      ${isArabic ? "السعر" : "Price"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                  <tr>
                    <td colspan="2" style="padding: 16px; text-align: ${isArabic ? 'left' : 'right'}; font-weight: bold; color: #4a3728;">
                      ${isArabic ? "الإجمالي" : "Total"}
                    </td>
                    <td style="padding: 16px; text-align: ${isArabic ? 'left' : 'right'}; font-weight: bold; color: #7a9b76; font-size: 18px;">
                      ${data.total} ${isArabic ? "ريال" : "SAR"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h3 style="color: #4a3728; margin: 0 0 16px 0; font-size: 18px;">
                ${isArabic ? "ما التالي؟" : "What's Next?"}
              </h3>
              <ul style="margin: 0; padding-${isArabic ? 'right' : 'left'}: 20px; color: #6b4423; line-height: 1.8;">
                <li>${isArabic ? "سنتواصل معك خلال ٢٤ ساعة لتأكيد طلبك" : "We'll contact you within 24 hours to confirm your order"}</li>
                <li>${isArabic ? "سيتم تحضير الشاي وتعبئته بعناية وحب" : "Your tea will be carefully prepared and packaged with love"}</li>
                <li>${isArabic ? "التوصيل عادة يستغرق ٢-٣ أيام عمل" : "Delivery typically takes 2-3 business days"}</li>
              </ul>
            </td>
          </tr>

          <!-- Contact Section -->
          <tr>
            <td style="padding: 0 30px 40px;">
              <div style="background-color: #e8f5e6; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 12px 0; color: #4a3728; font-size: 16px;">
                  ${isArabic ? "لديك أسئلة؟ تواصل معنا:" : "Questions? Contact us:"}
                </p>
                <a href="https://wa.me/966539666654" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                  WhatsApp: +966 53 966 6654
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #4a3728; padding: 24px 30px; text-align: center;">
              <p style="margin: 0; color: #f5f1e8; font-size: 14px;">
                © 2024 Lula Tea. ${isArabic ? "جميع الحقوق محفوظة" : "All rights reserved"}
              </p>
              <p style="margin: 8px 0 0 0; color: #f5f1e8; font-size: 12px;">
                ${isArabic ? "محضّر بحب" : "Made with love"}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}

export function generateOrderStatusEmail(
  orderId: string,
  customerName: string,
  status: string,
  language: "en" | "ar"
) {
  const isArabic = language === "ar";

  const statusMessages: Record<string, { en: string; ar: string }> = {
    confirmed: {
      en: "Your order has been confirmed and is being prepared.",
      ar: "تم تأكيد طلبك ويتم تحضيره الآن.",
    },
    processing: {
      en: "Your order is being processed and will be ready soon.",
      ar: "يتم معالجة طلبك وسيكون جاهزاً قريباً.",
    },
    shipped: {
      en: "Your order has been shipped and is on its way to you!",
      ar: "تم شحن طلبك وهو في طريقه إليك!",
    },
    delivered: {
      en: "Your order has been delivered. We hope you enjoy your tea!",
      ar: "تم توصيل طلبك. نتمنى أن تستمتع بالشاي!",
    },
  };

  const statusInfo = statusMessages[status] || statusMessages.confirmed;
  const subject = isArabic
    ? `تحديث الطلب - ${orderId}`
    : `Order Update - ${orderId}`;

  const html = `
<!DOCTYPE html>
<html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${isArabic ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f1e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f1e8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #7a9b76 0%, #6b4423 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                ${isArabic ? "لولا تي" : "Lula Tea"}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #4a3728; margin: 0 0 12px 0; font-size: 24px;">
                ${isArabic ? "تحديث الطلب" : "Order Update"}
              </h2>
              <p style="color: #6b4423; margin: 0 0 24px 0; font-size: 16px;">
                ${isArabic ? "مرحباً" : "Hello"}, ${customerName}
              </p>
              
              <div style="background-color: #f5f1e8; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #6b4423; font-size: 14px;">
                  ${isArabic ? "رقم الطلب" : "Order Number"}
                </p>
                <p style="margin: 0 0 16px 0; color: #4a3728; font-size: 20px; font-weight: bold;">
                  ${orderId}
                </p>
                <p style="margin: 0; color: #6b4423; font-size: 16px; line-height: 1.6;">
                  ${isArabic ? statusInfo.ar : statusInfo.en}
                </p>
              </div>

              <a href="https://wa.me/966539666654" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                ${isArabic ? "تواصل معنا" : "Contact Us"}
              </a>
            </td>
          </tr>

          <tr>
            <td style="background-color: #4a3728; padding: 24px 30px; text-align: center;">
              <p style="margin: 0; color: #f5f1e8; font-size: 14px;">
                © 2024 Lula Tea. ${isArabic ? "جميع الحقوق محفوظة" : "All rights reserved"}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}
