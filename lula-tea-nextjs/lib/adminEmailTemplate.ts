interface AdminNotificationData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryTime?: string;
  gpsCoordinates?: string;
  items: Array<{
    name: string;
    nameAr: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  qualifiesForFreeDelivery?: boolean;
}

export function generateAdminOrderNotification(data: AdminNotificationData) {
  const itemsList = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.name} (${item.nameAr})
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${item.price * item.quantity} SAR
          </td>
        </tr>`
    )
    .join("");

  const totalPacks = data.items.reduce((sum, item) => sum + item.quantity, 0);
  
  const mapsLink = data.gpsCoordinates 
    ? `https://maps.google.com/?q=${data.gpsCoordinates.replace(' ', '')}` 
    : '';

  const subject = `🔔 New Order: ${data.orderId} - ${totalPacks} pack${totalPacks > 1 ? 's' : ''} - ${data.total} SAR`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="700" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: bold;">
                🎉 New Order Received!
              </h1>
              <p style="color: #d1d5db; margin: 0; font-size: 16px;">
                Order #${data.orderId}
              </p>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #f9fafb; border-left: 4px solid #7a9b76; padding: 20px; margin-bottom: 24px; border-radius: 4px;">
                <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px;">Order Summary</h2>
                <table width="100%" style="margin-top: 12px;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount</p>
                      <p style="margin: 0; color: #059669; font-size: 28px; font-weight: bold;">${data.total} SAR</p>
                    </td>
                    <td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Total Packs</p>
                      <p style="margin: 0; color: #1f2937; font-size: 28px; font-weight: bold;">${totalPacks}</p>
                    </td>
                    <td style="padding: 8px 0;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Payment</p>
                      <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp'}</p>
                    </td>
                  </tr>
                </table>
                ${data.qualifiesForFreeDelivery ? `
                <div style="margin-top: 16px; padding: 12px; background-color: #d1fae5; border-radius: 6px;">
                  <p style="margin: 0; color: #065f46; font-weight: 600;">
                    ✅ Qualifies for FREE Delivery
                  </p>
                </div>
                ` : ''}
              </div>

              <!-- Customer Information -->
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Customer Information</h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="color: #6b7280; font-weight: 600; width: 140px; vertical-align: top;">Name:</td>
                  <td style="color: #1f2937; font-weight: 500;">${data.customerName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-weight: 600; vertical-align: top;">Phone:</td>
                  <td style="color: #1f2937; font-weight: 500;">
                    <a href="tel:${data.customerPhone}" style="color: #2563eb; text-decoration: none;">${data.customerPhone}</a>
                    <a href="https://wa.me/${data.customerPhone.replace(/\D/g, '')}" style="display: inline-block; margin-left: 8px; background-color: #25D366; color: #ffffff; padding: 4px 12px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                      WhatsApp
                    </a>
                  </td>
                </tr>
                ${data.customerEmail ? `
                <tr>
                  <td style="color: #6b7280; font-weight: 600; vertical-align: top;">Email:</td>
                  <td style="color: #1f2937; font-weight: 500;">
                    <a href="mailto:${data.customerEmail}" style="color: #2563eb; text-decoration: none;">${data.customerEmail}</a>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Delivery Information -->
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Delivery Information</h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="color: #6b7280; font-weight: 600; width: 140px; vertical-align: top;">Address:</td>
                  <td style="color: #1f2937; font-weight: 500;">${data.deliveryAddress}</td>
                </tr>
                ${data.deliveryTime ? `
                <tr>
                  <td style="color: #6b7280; font-weight: 600; vertical-align: top;">Preferred Time:</td>
                  <td style="color: #1f2937; font-weight: 500;">${data.deliveryTime}</td>
                </tr>
                ` : ''}
                ${data.gpsCoordinates ? `
                <tr>
                  <td style="color: #6b7280; font-weight: 600; vertical-align: top;">GPS Location:</td>
                  <td style="color: #1f2937; font-weight: 500;">
                    ${data.gpsCoordinates}
                    <a href="${mapsLink}" target="_blank" style="display: inline-block; margin-left: 8px; background-color: #3b82f6; color: #ffffff; padding: 4px 12px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                      📍 Open in Maps
                    </a>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Order Items -->
              <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Order Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600;">Product</th>
                    <th style="padding: 12px; text-align: center; color: #374151; font-weight: 600;">Quantity</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                  <tr style="background-color: #f9fafb;">
                    <td colspan="2" style="padding: 16px; text-align: right; font-weight: bold; color: #1f2937;">
                      Subtotal:
                    </td>
                    <td style="padding: 16px; text-align: right; font-weight: bold; color: #1f2937;">
                      ${data.subtotal} SAR
                    </td>
                  </tr>
                  ${data.deliveryFee > 0 ? `
                  <tr style="background-color: #f9fafb;">
                    <td colspan="2" style="padding: 16px; text-align: right; font-weight: bold; color: #1f2937;">
                      Delivery:
                    </td>
                    <td style="padding: 16px; text-align: right; font-weight: bold; color: #1f2937;">
                      ${data.deliveryFee} SAR
                    </td>
                  </tr>
                  ` : ''}
                  <tr style="background-color: #7a9b76;">
                    <td colspan="2" style="padding: 16px; text-align: right; font-weight: bold; color: #ffffff; font-size: 16px;">
                      TOTAL:
                    </td>
                    <td style="padding: 16px; text-align: right; font-weight: bold; color: #ffffff; font-size: 18px;">
                      ${data.total} SAR
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Quick Actions -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://lula-tea-nextjs.vercel.app/admin/orders" style="display: inline-block; background-color: #7a9b76; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 8px;">
                  View in Admin Panel
                </a>
                <a href="https://wa.me/${data.customerPhone.replace(/\D/g, '')}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 8px;">
                  Contact Customer
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Lula Tea Admin Notification • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
