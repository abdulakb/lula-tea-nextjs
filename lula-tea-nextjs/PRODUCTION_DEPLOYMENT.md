# Production Deployment Guide

## ✅ Authentication Status

**Current Setup: Email Authentication Only**

WhatsApp/Phone authentication has been **temporarily disabled** because:
- Twilio WhatsApp Sandbox requires users to manually "join" before receiving messages
- Not user-friendly for production customers
- Will be re-enabled once WhatsApp Business API is approved

**Active Authentication Methods:**
- ✅ Email + Password (with verification code)
- ✅ Password reset via email
- 🚫 Phone/WhatsApp OTP (disabled until production-ready)

---

## ⚠️ WhatsApp OTP - Currently Disabled

**Why disabled?**  
The WhatsApp Sandbox requires every user to send "join [code]" to +14155238886 before they can receive messages. This is not practical for real customers.

**To re-enable WhatsApp authentication in the future:**

1. **Apply for WhatsApp Business API** (see instructions below)
2. **Add Twilio environment variables to Vercel:**
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER` (your approved number)
3. **Re-enable phone authentication in the code:**
   - Update [AuthModal.tsx](app/components/AuthModal.tsx) to show phone/email tabs again
4. **Redeploy**

---

## 📱 WhatsApp Business API Setup (For Future Use)
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
- [ ] Test authentication flows (email signup, email login, password reset)
- [ ] Test order creation and checkout
- [ ] Verify Stripe test mode vs. live mode keys
- [ ] Check all environment variables in Vercel

### After Deployment:

- [ ] Test on production: https://www.lulatee.com
- [ ] Test email signup with verification code
- [ ] Test email login
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

**"Please enter a valid email address"**
- Email validation now enforces proper format (must contain @)
- Check that email has format: username@domain.com

**Database Errors**
- PGRST404: Check if migrations ran successfully
- PGRST204: Database schema cache needs refresh (happens after migrations)

**Stripe Errors**
- Using test keys in production → Switch to live keys
- Webhook signature mismatch → Update webhook secret in Vercel

---

## 🎯 Next Steps

1. **Test email authentication** on production (https://www.lulatee.com)
2. **Optional**: Apply for WhatsApp Business API if you want to re-enable phone auth later
3. **Optional**: Set up monitoring alerts (Sentry, LogRocket, etc.)
4. **Optional**: Configure custom domain email for professional look

---

## 💡 Tips

- Test with small amounts first (Stripe test mode)
- Keep development and production environment variables separate
- Always test authentication flows after deployment
- Email authentication is more reliable than SMS/WhatsApp for most use cases

---

**Last Updated**: December 21, 2025
**Status**: Email-only authentication active. WhatsApp/Phone auth disabled until WhatsApp Business API approved.
