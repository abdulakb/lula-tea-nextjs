# WhatsApp Automated Notifications System

## 🎯 Overview
Fully automated WhatsApp notification system that sends bilingual (Arabic + English) messages to customers throughout their order journey, with special cultural touches like "بالعافية" for delivered orders.

---

## ✨ Features

### 1. 📲 Order Confirmation (Automatic)
**Trigger:** Customer completes order on checkout page  
**Action:** WhatsApp opens automatically with invoice link  

**Message Format:**
```
✅ تم تأكيد طلبك من لولا تي!
✅ Order Confirmed - Lula Tea!

رقم الطلب / Order ID: LT1234567890
الإجمالي / Total: 150 ريال

تحميل الفاتورة / Download Invoice:
https://lulatee.com/api/invoice/LT1234567890

شكراً لطلبك! 🍵
Thank you for your order! 🍵

💚 لولة تي - مصنوع بحب
💚 Lula Tea - Homemade with Love
```

---

### 2. 🔔 Status Update Notifications (Semi-Automatic)
**Trigger:** Admin changes order status  
**Action:** Popup asks admin to confirm sending WhatsApp notification  

#### Status: Confirmed
```
مرحباً {Name}! 🌿
Hello {Name}!

📦 رقم الطلب / Order: {OrderID}

✅ تم تأكيد طلبك!
✅ Your order is confirmed!

نحن نحضر الشاي بحب ❤️
We're preparing your tea with love ❤️

أي استفسار؟ رد على هذه الرسالة
Any questions? Reply to this message

💚 لولة تي - مصنوع بحب
💚 Lula Tea - Homemade with Love
```

#### Status: Processing
```
مرحباً {Name}! 🌿
Hello {Name}!

📦 رقم الطلب / Order: {OrderID}

📦 يتم تحضير طلبك
📦 Your order is being prepared

سنقوم بالتوصيل قريباً
Will be delivered soon

أي استفسار؟ رد على هذه الرسالة
Any questions? Reply to this message

💚 لولة تي - مصنوع بحب
💚 Lula Tea - Homemade with Love
```

#### Status: Shipped
```
مرحباً {Name}! 🌿
Hello {Name}!

📦 رقم الطلب / Order: {OrderID}

🚚 طلبك في الطريق إليك!
🚚 Your order is on its way!

التوصيل المتوقع: خلال ٢-٣ أيام
Expected delivery: Within 2-3 days

أي استفسار؟ رد على هذه الرسالة
Any questions? Reply to this message

💚 لولة تي - مصنوع بحب
💚 Lula Tea - Homemade with Love
```

#### Status: Delivered ⭐ (Special Message)
```
مرحباً {Name}! 🌿
Hello {Name}!

📦 رقم الطلب / Order: {OrderID}

✨ تم توصيل طلبك بنجاح!
✨ Your order has been delivered!

🍵 *بالعافية* 🍵
🍵 *Enjoy your tea!* 🍵

نتمنى أن تستمتع بالشاي الفاخر
We hope you enjoy your premium tea

شاركنا تجربتك! / Share your experience!
https://lulatee.com

أي استفسار؟ رد على هذه الرسالة
Any questions? Reply to this message

💚 لولة تي - مصنوع بحب
💚 Lula Tea - Homemade with Love
```

#### Status: Cancelled
```
مرحباً {Name}! 🌿
Hello {Name}!

📦 رقم الطلب / Order: {OrderID}

❌ تم إلغاء الطلب
❌ Order cancelled

نأسف لإلغاء طلبك
Sorry for the cancellation

أي استفسار؟ رد على هذه الرسالة
Any questions? Reply to this message

💚 لولة تي - مصنوع بحب
💚 Lula Tea - Homemade with Love
```

---

## 🔧 Technical Implementation

### Phone Number Formatting
Automatically converts all formats to international format:
```javascript
// Input formats supported:
0512345678     → 966512345678 ✓
512345678      → 966512345678 ✓
+966512345678  → 966512345678 ✓
966512345678   → 966512345678 ✓
```

### WhatsApp URL Structure
```
https://wa.me/{phone}?text={encodedMessage}
```
- Uses wa.me links (no API credentials needed)
- Works on mobile and desktop
- Opens WhatsApp Web or app automatically

---

## 📁 Files Modified

### 1. `app/api/orders/create/route.ts`
**Changes:**
- Added automatic country code formatting
- Enhanced bilingual invoice message
- Added console logging for debugging
- Returns `customerInvoiceWhatsappUrl` to frontend

**Key Code:**
```typescript
// Clean phone and add Saudi country code
let cleanPhone = customerPhone.replace(/\D/g, '');
if (!cleanPhone.startsWith('966')) {
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '966' + cleanPhone.substring(1);
  } else {
    cleanPhone = '966' + cleanPhone;
  }
}

customerInvoiceWhatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
```

### 2. `app/api/orders/update-status/route.ts`
**Changes:**
- Complete rewrite of `sendStatusNotification()` function
- Removed WhatsApp Business API dependency
- Added bilingual status-specific messages
- Added `getMessagePreview()` helper function
- Returns `{success, whatsappUrl, phone, preview}` object

**Key Function:**
```typescript
async function sendStatusNotification(order: any, status: string) {
  // Format phone number with country code
  let cleanPhone = order.customer_phone.replace(/\D/g, '');
  if (!cleanPhone.startsWith('966')) {
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    } else {
      cleanPhone = '966' + cleanPhone;
    }
  }
  
  // Build status-specific bilingual message
  // Special handling for "delivered" status with "بالعافية"
  // ...
  
  return {
    success: true,
    whatsappUrl: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
    phone: cleanPhone
  };
}
```

### 3. `app/admin/orders/page.tsx`
**Changes:**
- Enhanced `updateOrderStatus()` function
- Added notification API call after status update
- Added confirmation popup with message preview
- Auto-opens WhatsApp on admin approval

**Key Code:**
```typescript
if (order && order.phone) {
  const notificationResponse = await fetch("/api/orders/update-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: order.id,
      status: newStatus,
      sendNotification: true,
    }),
  });

  const notificationData = await notificationResponse.json();
  
  if (notificationData.whatsappUrl) {
    const sendNow = confirm(
      `Status updated! Send WhatsApp notification to ${order.customer_name}?`
    );
    
    if (sendNow) {
      window.open(notificationData.whatsappUrl, '_blank');
    }
  }
}
```

### 4. `app/checkout/page.tsx`
**Existing functionality** (no changes needed):
- Already auto-opens WhatsApp with invoice
- Uses `customerInvoiceWhatsappUrl` from order creation API

---

## 👥 User Flows

### Customer Experience
1. **Place Order** → WhatsApp opens automatically with invoice link
2. **Order Confirmed** → Receives "نحن نحضر الشاي بحب ❤️" message
3. **Order Processing** → Receives preparation update
4. **Order Shipped** → Receives tracking information
5. **Order Delivered** → Receives special "🍵 بالعافية 🍵" message

### Admin Workflow
1. Navigate to **Admin → Orders**
2. Select order from list
3. Change status via dropdown menu
4. Popup appears: "Send WhatsApp notification to {Customer Name}?"
5. Preview shows message content in both languages
6. Click **OK** → WhatsApp opens in new tab with pre-filled message
7. Admin clicks **Send** in WhatsApp to deliver message

---

## ✅ Benefits

| Benefit | Description |
|---------|-------------|
| 🌐 **Bilingual** | Arabic and English in every message |
| ⚡ **Automated** | No manual message typing needed |
| 🎯 **Simple** | Uses wa.me links (no complex API setup) |
| 🎨 **Personal** | Custom messages for each order status |
| 🇸🇦 **Cultural** | Special "بالعافية" greeting for Saudi customers |
| 🔒 **Reliable** | Auto-formatting prevents phone number errors |
| 📱 **Universal** | Works on mobile and desktop |
| 💰 **Free** | No API costs or subscriptions |

---

## 🧪 Testing Guide

### Test 1: Order Confirmation
1. Create test order with real phone number
2. Complete checkout process
3. **Expected:** WhatsApp opens automatically
4. **Verify:** Message format, invoice link, bilingual content

### Test 2: Status Update - Confirmed
1. Go to **Admin → Orders**
2. Select any pending order
3. Change status to "Confirmed"
4. **Expected:** Popup with preview appears
5. Click **OK**
6. **Expected:** WhatsApp opens with "نحن نحضر الشاي بحب ❤️"
7. **Verify:** Both Arabic and English text, customer name, order ID

### Test 3: Status Update - Delivered
1. Select a shipped order
2. Change status to "Delivered"
3. **Expected:** Popup shows preview with "بالعافية"
4. Click **OK**
5. **Expected:** WhatsApp opens
6. **Verify:** Special "🍵 بالعافية 🍵" message appears
7. **Verify:** Feedback request link included

### Test 4: Phone Number Formats
Test orders with different phone formats:

| Input | Expected Output | Status |
|-------|----------------|--------|
| `0512345678` | `966512345678` | ✓ |
| `512345678` | `966512345678` | ✓ |
| `+966512345678` | `966512345678` | ✓ |
| `966512345678` | `966512345678` | ✓ |

### Test 5: All Status Messages
Test each status transition:
- [ ] pending → confirmed
- [ ] confirmed → processing
- [ ] processing → shipped
- [ ] shipped → delivered ⭐
- [ ] Any status → cancelled

---

## 🐛 Troubleshooting

### Issue: WhatsApp doesn't open

**Possible Causes:**
- Browser popup blocker enabled
- Invalid phone number
- JavaScript error

**Solutions:**
1. Check browser popup settings
2. Open browser console (F12) and look for errors
3. Verify phone number in database
4. Check network tab for API response

---

### Issue: Wrong phone number format

**Possible Causes:**
- Phone stored without country code
- Formatting logic not applied

**Solutions:**
1. Check order record in Supabase:
   ```sql
   SELECT customer_phone FROM orders WHERE order_id = 'LT1234567890';
   ```
2. Verify API console logs:
   ```
   WhatsApp notification prepared for {Name}: https://wa.me/966...
   ```
3. Test phone formatting function:
   ```javascript
   console.log(cleanPhone);
   ```

---

### Issue: Message not in correct language

**Possible Causes:**
- Order language not set correctly
- Message template missing translations

**Solutions:**
1. Check order language field in database
2. Verify both Arabic and English text in message
3. Update message templates in `sendStatusNotification()` if needed

---

### Issue: Admin popup doesn't appear

**Possible Causes:**
- API not returning `whatsappUrl`
- JavaScript error in frontend
- Network request failed

**Solutions:**
1. Open browser console and check for errors
2. Check Network tab for `/api/orders/update-status` response
3. Verify response includes:
   ```json
   {
     "success": true,
     "whatsappUrl": "https://wa.me/...",
     "phone": "966...",
     "preview": "..."
   }
   ```

---

### Issue: Special characters not displaying

**Possible Causes:**
- URL encoding issue
- WhatsApp character support

**Solutions:**
1. Verify `encodeURIComponent()` is used
2. Test special characters: ❤️ 🍵 ✨
3. Check WhatsApp Web/app for proper rendering

---

## 🚀 Future Enhancements

### Option 1: Full Automation (WhatsApp Business API)
**Currently:** Admin clicks to send (semi-automatic)  
**Future:** Automatic sending without admin action

**Steps:**
1. Set up WhatsApp Business API account
2. Get API token and Phone Number ID
3. Update `sendStatusNotification()` to call API:
   ```typescript
   await fetch('https://graph.facebook.com/v17.0/{phone-id}/messages', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       messaging_product: 'whatsapp',
       to: cleanPhone,
       text: { body: message }
     })
   });
   ```
4. Add to `.env`:
   ```
   WHATSAPP_API_TOKEN=your_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here
   ```

**Pros:** Fully automatic, no admin action needed  
**Cons:** Setup complexity, monthly costs, requires approval

---

### Option 2: Enhanced Features

#### Delivery Tracking Links
Add tracking URLs for shipped orders:
```javascript
if (status === "shipped" && order.tracking_number) {
  message += `\n📍 تتبع الشحنة / Track Order:\n${trackingUrl}`;
}
```

#### Customer Feedback Requests
Add rating system after delivery:
```javascript
if (status === "delivered") {
  message += `\n\n⭐ قيّم تجربتك / Rate your experience:\n${feedbackUrl}`;
}
```

#### Promotional Messages
Send offers to repeat customers:
```javascript
if (isRepeatCustomer) {
  message += `\n\n🎁 عرض خاص لك! / Special offer for you!\nDiscount code: LOYAL10`;
}
```

#### Admin Notification Preferences
Let admin choose which statuses trigger notifications:
- Settings page: Enable/disable per status
- Store preferences in database
- Check before sending notification

#### Message Template Management
Admin UI for customizing messages:
- Edit templates in dashboard
- Preview before saving
- Support for variables: {name}, {order_id}, {total}

#### Notification History
Log all sent notifications:
```sql
CREATE TABLE whatsapp_notifications (
  id UUID PRIMARY KEY,
  order_id VARCHAR(255),
  phone VARCHAR(20),
  message TEXT,
  status VARCHAR(50),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP
);
```

---

## 📋 Quick Reference

### Message Preview Shortcuts
| Status | Preview |
|--------|---------|
| confirmed | ✅ تم تأكيد طلبك! نحن نحضر الشاي بحب ❤️ |
| processing | 📦 يتم تحضير طلبك |
| shipped | 🚚 طلبك في الطريق إليك! |
| delivered | 🍵 بالعافية 🍵 تم توصيل طلبك |
| cancelled | ❌ تم إلغاء الطلب |

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/orders/create` | POST | Create order, generate invoice WhatsApp URL |
| `/api/orders/update-status` | POST | Update status, generate notification URL |
| `/api/invoice/{orderId}` | GET | Download invoice PDF |

### Console Commands
```javascript
// Test phone formatting
const phone = "0512345678";
const clean = phone.replace(/\D/g, '');
const formatted = clean.startsWith('0') ? '966' + clean.substring(1) : clean;
console.log(formatted); // 966512345678

// Test message encoding
const message = "🍵 بالعافية 🍵";
console.log(encodeURIComponent(message));

// Test WhatsApp URL
const url = `https://wa.me/966512345678?text=${encodeURIComponent(message)}`;
window.open(url, '_blank');
```

---

## 📞 Support

### Debug Checklist
- [ ] Check browser console for JavaScript errors
- [ ] Check server logs for API errors
- [ ] Verify phone number format in database
- [ ] Test WhatsApp URL manually
- [ ] Verify order status is valid
- [ ] Check network tab for API responses
- [ ] Test with different browsers
- [ ] Test on mobile device

### Important Environment Variables
```env
# Site URL for invoice links
SITE_URL=https://lulatee.com

# Admin contact (for notifications)
NEXT_PUBLIC_WHATSAPP_NUMBER=966539666654

# Optional: For full automation
WHATSAPP_API_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
```

---

## 🎉 Success Metrics

Track these metrics to measure success:
- ✅ **Order Confirmation Rate:** % of orders that auto-open WhatsApp
- ✅ **Admin Send Rate:** % of status changes where admin sends notification
- ✅ **Customer Response Rate:** % of customers who reply
- ✅ **Delivery Confirmation Rate:** % of customers who receive "بالعافية"
- ✅ **Error Rate:** % of notifications that fail

---

*Last Updated: January 2025*  
*Version: 1.0.0*  
*Author: GitHub Copilot*
