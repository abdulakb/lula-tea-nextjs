# WhatsApp Automation Setup Guide

## Overview
The Lula Tea website now includes WhatsApp Business API integration for automated customer responses and order status updates.

## Features Implemented

### 1. **Automated Customer Responses**
- Customers who message after ordering get instant automated replies
- Checks order status automatically
- Responds in both Arabic and English
- Answers common questions: order status, tracking, help

### 2. **Order Status Notifications**
- Automatic WhatsApp notifications when order status changes
- Bilingual messages (Arabic + English)
- Professional formatting with emojis
- Includes order details and next steps

### 3. **Mobile UX Improvements**
- Responsive hamburger menu for mobile
- Cart icon with item count badge
- Smooth animations and transitions
- Touch-friendly buttons (44px minimum)
- Sticky header with backdrop blur

## Setup Instructions

### Step 1: Get WhatsApp Business API Access

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Create a Business Account (if you don't have one)
3. Go to **Settings** → **WhatsApp Accounts**
4. Click **Add WhatsApp Account**
5. Follow the verification process

### Step 2: Get API Credentials

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new App (Type: Business)
3. Add **WhatsApp** product to your app
4. Get your credentials:
   - `WHATSAPP_API_TOKEN`: From App Dashboard → WhatsApp → API Access Token
   - `WHATSAPP_PHONE_NUMBER_ID`: From WhatsApp → API Setup → Phone Number ID

### Step 3: Configure Webhook

1. In Meta for Developers → Your App → WhatsApp → Configuration
2. Click **Edit** next to Webhook
3. Set Callback URL: `https://lula-tea-nextjs.vercel.app/api/whatsapp/webhook`
4. Set Verify Token: `lulatea_webhook_verify`
5. Subscribe to: `messages`

### Step 4: Add Environment Variables

Add these to your Vercel environment variables:

```env
WHATSAPP_API_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=lulatea_webhook_verify
```

### Step 5: Test the Integration

1. Send a test message to your WhatsApp Business number
2. Type "order" to check order status
3. Type "help" to see available commands
4. Place a test order and verify you receive confirmation

## How It Works

### Customer Messages You

When a customer sends a message to your WhatsApp Business number:

1. Message is received by `/api/whatsapp/webhook`
2. System checks for customer's recent orders in database
3. Generates appropriate response based on message content
4. Sends automated reply instantly

### Supported Commands

Customers can send:
- `order` / `طلب` → Get order status
- `status` / `حالة` → Check order status
- `track` / `تتبع` → Track order
- `help` / `مساعدة` → Get help menu
- Any other message → Welcome greeting

### Order Status Updates

When you update an order status in the admin panel:

1. Status is updated in database
2. `/api/orders/update-status` is called
3. Customer receives WhatsApp notification automatically
4. Message includes:
   - Order number
   - New status (Arabic + English)
   - Status description
   - Next steps
   - Contact option

## Admin Panel Integration

### Updating Order Status

Use the admin panel or API:

```javascript
// POST /api/orders/update-status
{
  "orderId": "LT1234567890",
  "status": "shipped",
  "adminPassword": "lulatea2024"
}
```

Valid statuses:
- `pending` - Order received
- `confirmed` - Order confirmed
- `processing` - Being prepared
- `shipped` - On the way
- `delivered` - Completed
- `cancelled` - Cancelled

## Benefits

### For Customers:
✅ Instant responses 24/7
✅ No waiting for manual replies
✅ Automatic order tracking
✅ Bilingual support
✅ Real-time status updates

### For Business:
✅ Reduced support workload
✅ Better customer satisfaction
✅ Professional appearance
✅ Automated follow-ups
✅ Scalable communication

## Cost

**WhatsApp Business API Pricing:**
- First 1,000 conversations/month: **FREE**
- After that: ~$0.005-0.01 per message (varies by country)
- Most small businesses stay within free tier

## Troubleshooting

### Webhook Not Receiving Messages
1. Check webhook URL is correct
2. Verify token matches
3. Ensure webhook is subscribed to `messages`
4. Check Vercel logs for errors

### Messages Not Sending
1. Verify `WHATSAPP_API_TOKEN` is valid
2. Check `WHATSAPP_PHONE_NUMBER_ID` is correct
3. Ensure API token has permissions
4. Check Meta Business account status

### Order Status Not Found
1. Verify phone number format in database
2. Check customer_phone matches exactly
3. Ensure orders are being saved correctly

## Future Enhancements

Possible additions:
- Rich media messages (images, PDFs)
- Interactive buttons
- Quick reply templates
- Delivery tracking with maps
- Customer feedback collection
- Automated reminder for repeat orders

## Support

If you need help:
1. Check Vercel logs: `vercel logs`
2. Check Meta Developer Console for errors
3. Test webhook with Meta's testing tools
4. Review database records for data integrity

---

**Important**: Keep your API tokens secure. Never commit them to GitHub. Use Vercel environment variables only.
