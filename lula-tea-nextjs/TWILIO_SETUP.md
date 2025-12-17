# Twilio WhatsApp Setup Guide

## ✅ Step 1: Get Your Credentials

1. Go to: https://console.twilio.com/
2. Look for "Account Info" box on the dashboard
3. Copy these values:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click 👁️ icon to reveal

## ✅ Step 2: Update .env.local

Replace these lines in your `.env.local` file:

```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxx"  # Paste your Account SID here
TWILIO_AUTH_TOKEN="your_auth_token_here"      # Paste your Auth Token here
TWILIO_WHATSAPP_NUMBER="+14155238886"         # Keep this as is (sandbox number)
```

## ✅ Step 3: Join WhatsApp Sandbox (Your Phone)

1. Add Twilio's WhatsApp number to your contacts: **+1 415 523 8886**
2. Send a WhatsApp message with the join code shown in Twilio console (e.g., "join capital-garden")
3. You'll receive a confirmation message

## ✅ Step 4: Add Customer Numbers to Sandbox

For testing, any phone number that will receive OTP codes must:
1. Save Twilio's number: **+1 415 523 8886**
2. Send the join code via WhatsApp

## ✅ Step 5: Test

1. Restart your dev server: `npm run dev`
2. Go to: http://localhost:3000/account
3. Click Phone tab and enter your number
4. Request OTP - you'll receive it via WhatsApp!

## 📝 Notes

- **Sandbox is FREE** for testing
- Each person testing must join the sandbox
- For production, you'll need to register a WhatsApp sender (different process)
- If WhatsApp fails, system automatically sends OTP via Email

## 🚀 Production Setup (Later)

When ready for production:
1. Apply for WhatsApp Business Profile approval
2. Get your own WhatsApp sender number
3. Update `TWILIO_WHATSAPP_NUMBER` with your approved number
