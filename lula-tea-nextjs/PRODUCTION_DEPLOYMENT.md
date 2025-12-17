# Production Deployment Guide

## ⚠️ WhatsApp OTP Not Working in Production - FIX REQUIRED

### Problem
WhatsApp verification codes are failing in production because Twilio environment variables are not configured in Vercel.

### Solution: Add Twilio Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `lula-tea-nextjs`

2. **Navigate to Environment Variables**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add These Variables** (one by one):

   ```
   Variable Name: TWILIO_ACCOUNT_SID
   Value: [Get from TWILIO_SETUP.md file - your Twilio Account SID]
   Environment: Production, Preview, Development
   ```

   ```
   Variable Name: TWILIO_AUTH_TOKEN
   Value: [Get from TWILIO_SETUP.md file - your Twilio Auth Token]
   Environment: Production, Preview, Development
   ```

   ```
   Variable Name: TWILIO_WHATSAPP_NUMBER
   Value: [Get from TWILIO_SETUP.md file - WhatsApp sandbox number]
   Environment: Production, Preview, Development
   ```
   
   **📝 Note**: Find your actual Twilio credentials in the `TWILIO_SETUP.md` file in this repository.

4. **Verify Existing Variables**
   Make sure these are already configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

5. **Redeploy**
   After adding variables:
   - Go to **Deployments** tab
   - Click the **...** menu on the latest deployment
   - Click **Redeploy**
   - ✅ Check "Use existing Build Cache"
   - Click **Redeploy**

### Testing After Deployment

1. Visit https://www.lulatee.com
2. Click Account → Sign In/Sign Up
3. Enter phone number: 0566668958
4. Click "Send Code"
5. Check WhatsApp for verification code
6. If it fails, check email as fallback

---

## 📱 WhatsApp Sandbox Limitation (Current Setup)

### Current Status: Development Sandbox
- You're using Twilio's **WhatsApp Sandbox**: `+14155238886`
- **Limitation**: Users must send "join <code>" to the sandbox number before receiving messages
- **Not ideal for production**

### For Production-Ready WhatsApp:

#### Option 1: Apply for WhatsApp Business API (Recommended)
1. Go to Twilio Console: https://console.twilio.com
2. Navigate to **Messaging** → **WhatsApp** → **Senders**
3. Click **Request Access** for WhatsApp Business API
4. Fill out business profile:
   - Business Name: Lula Tea
   - Business Website: https://www.lulatee.com
   - Business Description: Premium homemade tea blends
   - Country: Saudi Arabia
5. Wait for approval (typically 1-3 business days)
6. Once approved, update `TWILIO_WHATSAPP_NUMBER` in Vercel with your approved number

#### Option 2: Use Email OTP Only (Current Fallback)
- Email OTP via Resend is already working
- Users can sign up with email instead of phone
- More reliable for production until WhatsApp is approved

---

## 🗃️ Database Migrations (Already Completed)

These migrations have been run on your Supabase database:

✅ `001_create_orders_table.sql` - Orders table  
✅ `002_create_analytics_table.sql` - Analytics tracking  
✅ `003_add_order_details.sql` - Order details  
✅ `006_create_customer_auth_tables.sql` - Customer authentication  
✅ `007_add_email_password_auth.sql` - Email/password support  
✅ Phone column made nullable - Supports email-only accounts  

---

## 🚀 Deployment Checklist

### Before Each Deployment:

- [ ] Run `npm run build` locally to check for errors
- [ ] Test authentication flows (phone OTP, email OTP, password login)
- [ ] Test order creation and checkout
- [ ] Verify Stripe test mode vs. live mode keys
- [ ] Check all environment variables in Vercel

### After Deployment:

- [ ] Test on production: https://www.lulatee.com
- [ ] Verify WhatsApp OTP delivery
- [ ] Test email OTP as fallback
- [ ] Place a test order
- [ ] Check order appears in admin dashboard
- [ ] Test password reset flow

---

## 🔐 Security Notes

### Keep These Secret (Never Commit):
- `TWILIO_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (if you add it later)

### Public Keys (Safe to Commit):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## 📊 Monitoring Production

### Check Logs:
- **Vercel Logs**: https://vercel.com/dashboard → Project → Logs
- **Twilio Logs**: https://console.twilio.com/monitor/logs
- **Supabase Logs**: Supabase Dashboard → Logs

### Common Issues:

**"Failed to send OTP"**
- Missing Twilio environment variables → Add them in Vercel
- Twilio account suspended → Check Twilio console balance
- WhatsApp sandbox not joined → User needs to join sandbox first

**Database Errors**
- PGRST404: Check if migrations ran successfully
- PGRST204: Database schema cache needs refresh (happens after migrations)

**Stripe Errors**
- Using test keys in production → Switch to live keys
- Webhook signature mismatch → Update webhook secret in Vercel

---

## 🎯 Next Steps

1. **Immediate**: Add Twilio environment variables in Vercel (see top of this document)
2. **Short-term**: Apply for WhatsApp Business API approval
3. **Optional**: Set up monitoring alerts (Sentry, LogRocket, etc.)
4. **Optional**: Configure custom domain email for professional look

---

## 💡 Tips

- Test with small amounts first (Stripe test mode)
- Keep development and production environment variables separate
- Always test authentication flows after deployment
- Monitor Twilio usage to avoid unexpected charges
- Consider adding rate limiting for OTP requests

---

**Last Updated**: December 17, 2025
**Status**: Production deployment ready after adding Twilio env vars
