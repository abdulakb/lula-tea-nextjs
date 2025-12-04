# WhatsApp Notification System - How It Works

## Current Implementation

The WhatsApp notification system is now **enabled** and will generate notification links when orders are placed.

### How It Works:

1. **When an order is placed**, the system generates a WhatsApp message link
2. **The notification includes**:
   - Order ID
   - Customer name and phone
   - Order total
   - Payment method
   - Link to view order details in admin

3. **Where to find notifications**:
   - Check your server logs/console for the WhatsApp URL
   - The URL format is: `https://wa.me/966539666654?text=<encoded_message>`

### Important Notes:

⚠️ **Current Limitation**: The system generates WhatsApp web links but doesn't automatically send them. This is because you need a **WhatsApp Business API** account for true automation.

### To Receive Automatic Notifications:

You have two options:

#### Option 1: Manual Check (Current)
- After each order, check the server logs
- Click the generated WhatsApp link to view the notification
- This opens WhatsApp with the pre-filled message

#### Option 2: Upgrade to WhatsApp Business API (Recommended for Production)
To get true automatic push notifications:

1. **Sign up for WhatsApp Business API**:
   - Go to https://business.whatsapp.com/products/business-platform
   - Or use a provider like Twilio, MessageBird, or 360dialog

2. **Get your API credentials**:
   - API key/token
   - Phone number ID
   - Business account ID

3. **Update the code**:
   - Add credentials to `.env.local`:
     ```
     WHATSAPP_API_KEY=your_api_key
     WHATSAPP_PHONE_ID=your_phone_id
     ```
   
   - Modify `/app/api/notifications/whatsapp/route.ts` to use the API:
     ```typescript
     // Instead of generating wa.me links, send via API:
     const response = await fetch('https://graph.facebook.com/v17.0/{phone-id}/messages', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         messaging_product: "whatsapp",
         to: phoneNumber,
         text: { body: message }
       })
     });
     ```

## Testing the Current System

1. **Place a test order** on your site
2. **Check Vercel logs**:
   - Go to https://vercel.com/your-project/logs
   - Look for "WhatsApp notification link generated"
   - You'll see the URL printed in the logs

3. **Or check browser console**:
   - Open browser DevTools (F12)
   - Look in the Network tab for the `/api/orders/create` request
   - Check the response for WhatsApp notification details

## Admin Portal Settings

The notification settings in `/admin/notifications` control:
- ✅ Whether to generate notifications
- ✅ Which events trigger notifications (new order, status change, low stock)
- ✅ Admin WhatsApp number (966539666654)
- ✅ Low stock threshold

These settings are saved in browser localStorage and checked when orders are created.

## Dark Mode Toggle

The dark mode toggle is now available on:
- ✅ Homepage (`/`)
- ✅ Product page (`/product`)
- ✅ Checkout page (`/checkout`)
- ✅ All admin pages (`/admin/*`)

**Location**: Floating button in bottom-right corner
**Icon**: Sun (☀️) for light mode, Moon (🌙) for dark mode
**Persistence**: Theme preference saved in localStorage

---

**Questions?** Check the Vercel deployment logs after placing an order to see the WhatsApp notification URL being generated.
