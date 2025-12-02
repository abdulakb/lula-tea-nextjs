# Email Setup Guide for Lula Tea

## 🎯 Overview
This guide will help you set up email notifications for order confirmations and admin alerts.

## 📧 Get Resend API Key

### Step 1: Sign Up for Resend
1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" (it's FREE - 3,000 emails/month on free tier)
3. Verify your email

### Step 2: Get Your API Key
1. Log in to your Resend dashboard
2. Go to **API Keys** section
3. Click **"Create API Key"**
4. Name it: "Lula Tea Production"
5. Copy the API key (starts with `re_`)

### Step 3: Add API Key to Your Project
1. Open `.env.local` file in your project root
2. Find the line: `RESEND_API_KEY="re_123456789"`
3. Replace `re_123456789` with your actual API key:
   ```
   RESEND_API_KEY="re_your_actual_key_here"
   ```
4. Save the file

### Step 4: Verify Domain (Optional but Recommended)
For production, verify your domain to send from your own email address:

1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `lula-tea.com`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually 5-30 minutes)

**Before verification:** Emails sent from `onboarding@resend.dev`  
**After verification:** Emails sent from `orders@yourdomain.com`

## 📬 What Emails Will Be Sent?

### Customer Confirmation Email
- **To:** Customer's email (if provided in checkout)
- **Subject:** "Order Confirmation - [OrderID]"
- **Contains:**
  - Order number
  - Items purchased
  - Total amount
  - Payment method
  - Thank you message
  - Contact information

### Admin Notification Email
- **To:** `ak.bahareth@gmail.com` (configured in `.env.local`)
- **Subject:** "🔔 New Order: [OrderID] - [X] pack(s) - [Total] SAR"
- **Contains:**
  - Complete order details
  - Customer information (name, phone, email)
  - Delivery address with GPS link
  - Delivery time preference
  - Quick action buttons:
    - View in Admin Panel
    - Contact Customer via WhatsApp
    - Open location in Google Maps

## 🧪 Test Your Setup

1. Restart your development server:
   ```powershell
   npm run dev
   ```

2. Place a test order:
   - Go to checkout page
   - Fill in all details
   - **Important:** Enter an email address
   - Submit order

3. Check for emails:
   - Customer: Check the email you entered
   - Admin: Check `ak.bahareth@gmail.com`
   - Check spam folder if not in inbox

4. Check server logs:
   - Look for "Sending customer confirmation email to: ..."
   - Look for "Customer email result: ..."
   - Look for "Admin email result: ..."

## 🔍 Troubleshooting

### Emails Not Sending?

**Check 1: API Key**
```powershell
# In terminal, check if API key is set
$env:RESEND_API_KEY
```
Should show your key. If blank, restart terminal after saving `.env.local`

**Check 2: Server Logs**
Look for these messages in terminal:
- ✅ "Sending customer confirmation email to: ..."
- ✅ "Sending admin notification to: ak.bahareth@gmail.com"
- ❌ "RESEND_API_KEY not configured, skipping email notifications"

**Check 3: Resend Dashboard**
1. Go to Resend dashboard → **Logs**
2. See if emails were attempted
3. Check for errors

### Common Issues

**Issue:** "RESEND_API_KEY not configured"
- **Solution:** Make sure API key is in `.env.local` and restart server

**Issue:** "Email sent but not received"
- **Solution:** Check spam folder
- **Solution:** In Resend, check Logs for delivery status

**Issue:** Customer not receiving emails
- **Solution:** Customer must provide email address in checkout form
- **Solution:** Verify email address is correct

**Issue:** Admin not receiving emails
- **Solution:** Verify `ADMIN_EMAIL="ak.bahareth@gmail.com"` is in `.env.local`

## 📊 Data Captured in Each Order

Every order saves the following to PostgreSQL database:

### Customer Information
- ✅ Order ID (e.g., `LT1733097600000`)
- ✅ Customer Name
- ✅ Customer Email (if provided)
- ✅ Customer Phone
- ✅ Delivery Address (formatted)

### Order Details
- ✅ Items ordered (product name, quantity, price)
- ✅ Quantity ordered (total packs)
- ✅ Subtotal
- ✅ Delivery fee
- ✅ Total amount
- ✅ Payment method

### Delivery Information
- ✅ GPS Coordinates (latitude, longitude)
- ✅ Delivery address formatted
- ✅ Delivery time preference
- ✅ Delivery notes
- ✅ Free delivery qualification status

### Timestamps
- ✅ Order date
- ✅ Created at timestamp
- ✅ Order status (pending, confirmed, processing, shipped, delivered)

### Additional
- ✅ PDF Invoice (base64 encoded)

## 🎉 Success Checklist

- [ ] Resend account created
- [ ] API key added to `.env.local`
- [ ] Server restarted
- [ ] Test order placed
- [ ] Customer email received (if email provided)
- [ ] Admin email received at `ak.bahareth@gmail.com`
- [ ] Order visible in admin panel
- [ ] PDF invoice downloadable
- [ ] All order data in database

## 🚀 Production Deployment

When deploying to Vercel:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:
   ```
   RESEND_API_KEY = your_actual_key
   ADMIN_EMAIL = ak.bahareth@gmail.com
   ```
3. Redeploy your site

---

**Need Help?**  
- Resend Documentation: https://resend.com/docs
- Resend Support: https://resend.com/support
