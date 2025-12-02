# 🚀 Quick Email Setup (5 Minutes)

## The Problem
Your emails aren't sending because the API key is invalid:
```
Email send error: { statusCode: 401, message: 'API key is invalid' }
```

## The Solution (FREE & Takes 5 Minutes)

### Step 1: Sign Up for Resend (FREE)
1. Go to: https://resend.com/signup
2. Sign up with your email
3. Verify your email address

### Step 2: Get Your API Key
1. Log in to Resend dashboard: https://resend.com/api-keys
2. You'll see a default API key already created OR click "Create API Key"
3. Copy the key (starts with `re_`)

### Step 3: Update Your Environment Variable
1. Open `.env.local` file in your project
2. Find this line:
   ```
   RESEND_API_KEY="re_123456789" # Replace with your actual Resend API key
   ```
3. Replace with your real key:
   ```
   RESEND_API_KEY="re_your_actual_key_here"
   ```
4. Save the file

### Step 4: Restart Your Dev Server
```powershell
# Stop the current server (Ctrl+C in terminal)
# Then run:
npm run dev
```

### Step 5: Test It!
1. Go to checkout
2. Add an email address (important!)
3. Complete the order
4. Check:
   - ✅ Customer email inbox
   - ✅ `ak.bahareth@gmail.com` (admin email)

---

## What Emails Will Be Sent?

### 1. Customer Confirmation Email
**To:** Customer's email (if they provide one)  
**Contains:**
- Order number
- Items ordered
- Total amount
- Payment method
- Thank you message

### 2. Admin Notification Email
**To:** `ak.bahareth@gmail.com`  
**Subject:** `🔔 New Order: LT1764634902936 - 5 pack(s) - 300 SAR`  
**Contains:**
- Complete order details
- Customer contact info
- WhatsApp button to contact customer
- GPS location link
- Quick action buttons

---

## Current Status

✅ Order created successfully (LT1764634902936)  
✅ Saved to database  
✅ PDF invoice generated  
❌ Emails failed (invalid API key)  

**Once you add the real API key, emails will work immediately!**

---

## Free Tier Limits

Resend FREE plan includes:
- ✅ 3,000 emails per month
- ✅ 100 emails per day
- ✅ Perfect for starting out

That's plenty for a new tea business! 🍵

---

## Troubleshooting

**Q: I added the key but still getting errors**  
A: Make sure you restarted the dev server after updating `.env.local`

**Q: Emails sending but not receiving**  
A: Check spam folder. Emails from `onboarding@resend.dev` might be filtered.

**Q: Want to use custom email address like orders@lulatea.com?**  
A: Verify your domain in Resend (optional, takes 10-30 minutes for DNS propagation)

---

**Need more help?** Check `SETUP_EMAIL.md` for detailed instructions.
