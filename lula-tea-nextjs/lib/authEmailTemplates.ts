/**
 * Email templates for authentication and customer management
 */

/**
 * Welcome email for new customers
 */
export function generateWelcomeEmail(
  customerName: string,
  language: "en" | "ar"
) {
  const isArabic = language === "ar";
  const subject = isArabic
    ? "مرحباً بك في لولا تي!"
    : "Welcome to Lula Tea!";

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
              <p style="color: #f5f1e8; margin: 8px 0 0 0; font-size: 14px;">
                ${isArabic ? "محضّر بحب في المنزل" : "Homemade with Love"}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #4a3728; margin: 0 0 16px 0; font-size: 28px;">
                ${isArabic ? `مرحباً ${customerName}!` : `Welcome ${customerName}!`}
              </h2>
              <p style="color: #6b4423; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                ${isArabic 
                  ? "شكراً لانضمامك إلى عائلة لولا تي! نحن متحمسون لمشاركة شغفنا بالشاي الفاخر معك."
                  : "Thank you for joining the Lula Tea family! We're excited to share our passion for premium tea with you."}
              </p>

              <div style="background-color: #e8f5e6; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: ${isArabic ? 'right' : 'left'};">
                <h3 style="color: #4a3728; margin: 0 0 16px 0; font-size: 20px;">
                  ${isArabic ? "ما يميزنا:" : "What Makes Us Special:"}
                </h3>
                <ul style="margin: 0; padding-${isArabic ? 'right' : 'left'}: 20px; color: #6b4423; line-height: 1.8;">
                  <li>${isArabic ? "شاي أوراق سائبة فاخر" : "Premium loose leaf tea"}</li>
                  <li>${isArabic ? "مكونات محسوبة بعناية" : "Carefully calculated ingredients"}</li>
                  <li>${isArabic ? "صُنع بحب يدوياً" : "Handcrafted with love"}</li>
                  <li>${isArabic ? "توصيل سريع وموثوق" : "Fast and reliable delivery"}</li>
                </ul>
              </div>

              <a href="https://lulatee.com/product" style="display: inline-block; background-color: #7a9b76; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
                ${isArabic ? "تسوق الآن" : "Shop Now"}
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f5f1e8; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 12px 0; color: #4a3728; font-size: 16px;">
                  ${isArabic ? "تواصل معنا على واتساب:" : "Contact us on WhatsApp:"}
                </p>
                <a href="https://wa.me/966539666654" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                  +966 53 966 6654
                </a>
              </div>
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

/**
 * Email verification template
 */
export function generateVerificationEmail(
  customerName: string,
  verificationLink: string,
  language: "en" | "ar"
) {
  const isArabic = language === "ar";
  const subject = isArabic
    ? "تأكيد بريدك الإلكتروني - لولا تي"
    : "Verify Your Email - Lula Tea";

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
              <h2 style="color: #4a3728; margin: 0 0 16px 0; font-size: 24px;">
                ${isArabic ? `مرحباً ${customerName}!` : `Hello ${customerName}!`}
              </h2>
              <p style="color: #6b4423; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                ${isArabic 
                  ? "شكراً لتسجيلك في لولا تي! للبدء، يرجى تأكيد بريدك الإلكتروني بالنقر على الزر أدناه."
                  : "Thank you for signing up with Lula Tea! To get started, please verify your email by clicking the button below."}
              </p>

              <a href="${verificationLink}" style="display: inline-block; background-color: #7a9b76; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
                ${isArabic ? "تأكيد البريد الإلكتروني" : "Verify Email"}
              </a>

              <p style="color: #999; margin: 24px 0 0 0; font-size: 14px;">
                ${isArabic 
                  ? "إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد الإلكتروني بأمان."
                  : "If you didn't create an account, you can safely ignore this email."}
              </p>

              <p style="color: #999; margin: 16px 0 0 0; font-size: 12px; line-height: 1.6;">
                ${isArabic 
                  ? "ينتهي رابط التأكيد خلال 24 ساعة."
                  : "This verification link will expire in 24 hours."}
              </p>
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

/**
 * Password reset email template
 */
export function generatePasswordResetEmail(
  customerName: string,
  resetLink: string,
  language: "en" | "ar"
) {
  const isArabic = language === "ar";
  const subject = isArabic
    ? "إعادة تعيين كلمة المرور - لولا تي"
    : "Reset Your Password - Lula Tea";

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
              <h2 style="color: #4a3728; margin: 0 0 16px 0; font-size: 24px;">
                ${isArabic ? "إعادة تعيين كلمة المرور" : "Reset Your Password"}
              </h2>
              <p style="color: #6b4423; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                ${isArabic ? `مرحباً ${customerName}،` : `Hello ${customerName},`}
              </p>
              <p style="color: #6b4423; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                ${isArabic 
                  ? "تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك. انقر على الزر أدناه لإعادة تعيين كلمة المرور الخاصة بك."
                  : "We received a request to reset your password. Click the button below to reset your password."}
              </p>

              <a href="${resetLink}" style="display: inline-block; background-color: #7a9b76; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
                ${isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password"}
              </a>

              <p style="color: #999; margin: 24px 0 0 0; font-size: 14px;">
                ${isArabic 
                  ? "إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان."
                  : "If you didn't request a password reset, you can safely ignore this email."}
              </p>

              <p style="color: #999; margin: 16px 0 0 0; font-size: 12px; line-height: 1.6;">
                ${isArabic 
                  ? "ينتهي رابط إعادة التعيين خلال 24 ساعة لأسباب أمنية."
                  : "This reset link will expire in 24 hours for security reasons."}
              </p>
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

/**
 * Order cancellation confirmation email
 */
export function generateOrderCancellationEmail(
  orderId: string,
  customerName: string,
  reason: string,
  language: "en" | "ar"
) {
  const isArabic = language === "ar";
  const subject = isArabic
    ? `تم إلغاء الطلب - ${orderId}`
    : `Order Cancelled - ${orderId}`;

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
              <h2 style="color: #4a3728; margin: 0 0 16px 0; font-size: 24px;">
                ${isArabic ? "تم إلغاء الطلب" : "Order Cancelled"}
              </h2>
              <p style="color: #6b4423; margin: 0 0 24px 0; font-size: 16px;">
                ${isArabic ? `مرحباً ${customerName}،` : `Hello ${customerName},`}
              </p>

              <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 16px; margin: 24px 0; text-align: ${isArabic ? 'right' : 'left'};">
                <p style="margin: 0 0 8px 0; color: #6b4423; font-size: 14px; font-weight: bold;">
                  ${isArabic ? "رقم الطلب:" : "Order Number:"}
                </p>
                <p style="margin: 0 0 16px 0; color: #4a3728; font-size: 18px; font-weight: bold;">
                  ${orderId}
                </p>
                <p style="margin: 0; color: #6b4423; font-size: 14px; line-height: 1.6;">
                  ${isArabic 
                    ? "تم إلغاء طلبك بنجاح. سيتم إعادة أي مبلغ مدفوع خلال 5-7 أيام عمل."
                    : "Your order has been successfully cancelled. Any payment will be refunded within 5-7 business days."}
                </p>
              </div>

              ${reason ? `
              <div style="background-color: #f5f1e8; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: ${isArabic ? 'right' : 'left'};">
                <p style="margin: 0 0 8px 0; color: #6b4423; font-size: 14px; font-weight: bold;">
                  ${isArabic ? "سبب الإلغاء:" : "Cancellation Reason:"}
                </p>
                <p style="margin: 0; color: #4a3728; font-size: 14px; line-height: 1.6;">
                  ${reason}
                </p>
              </div>
              ` : ''}

              <p style="color: #6b4423; margin: 24px 0; font-size: 16px; line-height: 1.6;">
                ${isArabic 
                  ? "نأسف لرؤيتك تغادر. نحن هنا دائماً إذا كنت ترغب في تجربة شاي لولا تي في المستقبل!"
                  : "We're sorry to see you go. We're always here if you'd like to try Lula Tea in the future!"}
              </p>

              <a href="https://lulatee.com" style="display: inline-block; background-color: #7a9b76; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
                ${isArabic ? "تسوق مرة أخرى" : "Shop Again"}
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px 30px;">
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
