# 🔐 Lula Tea - Complete Credentials & Access

> **⚠️ CRITICAL SECURITY WARNING:**  
> This file contains sensitive credentials. Do NOT commit to GitHub.  
> Store securely and share only via encrypted channels.  
> Delete this file after securely storing credentials elsewhere.

---

## 🌐 Website & Hosting

### Domain
- **URL:** https://www.lulatee.com
- **Registrar:** [Domain registrar name]
- **Login:** [Domain account email]
- **Password:** `[DOMAIN_PASSWORD]`
- **Renewal Date:** [Date]

### Vercel (Hosting Platform)
- **Dashboard:** https://vercel.com
- **Account Email:** [Vercel account email]
- **Password:** `[VERCEL_PASSWORD]`
- **Project Name:** lula-tea-nextjs
- **Team:** [Team name if applicable]
- **Region:** Washington DC (iad1)
- **Deployment:** Auto from GitHub main branch

---

## 💾 Database (Supabase)

### Supabase Account
- **Dashboard:** https://supabase.com/dashboard
- **Account Email:** [Supabase account email]
- **Password:** `[SUPABASE_PASSWORD]`
- **2FA:** [Enabled/Disabled]

### Project Details
- **Project Name:** lula-tea-nextjs
- **Project ID:** ktvbmxliscwhmlxlfyly
- **Organization:** [Organization name]
- **Region:** [Region]

### Database Connection
```
Host: db.ktvbmxliscwhmlxlfyly.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [SUPABASE_DB_PASSWORD]
```

### API Keys
```env
# Public (Safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://ktvbmxliscwhmlxlfyly.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUPABASE_ANON_KEY]

# Private (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=[SUPABASE_SERVICE_KEY]
```

**Find Keys:** Supabase Dashboard → Project Settings → API

---

## 📧 Email Service (Resend)

### Resend Account
- **Dashboard:** https://resend.com/overview
- **Account Email:** [Resend account email]
- **Password:** `[RESEND_PASSWORD]`

### API Configuration
```env
RESEND_API_KEY=[RESEND_API_KEY]
```

### Verified Domain
- **Domain:** lulatee.com
- **From Email:** orders@lulatee.com
- **DNS Records:** Configured in domain registrar

### Email Limits
- **Plan:** [Free/Pro/Enterprise]
- **Monthly Limit:** [Number] emails
- **Current Usage:** Check dashboard

---

## 🔐 Admin Panel Access

### Admin Login
- **URL:** https://www.lulatee.com/admin
- **Username:** admin *(hardcoded)*
- **Password:** `[ADMIN_PASSWORD]`

### Environment Variable
```env
ADMIN_PASSWORD=[ADMIN_PASSWORD]
```

**Change Password:**
1. Update `.env.local` locally
2. Update Vercel environment variable:
   - Vercel Dashboard → Project Settings → Environment Variables
   - Edit `ADMIN_PASSWORD`
3. Redeploy application

---

## 💬 WhatsApp Business

### Account Details
- **Phone Number:** +966539666654
- **Business Name:** Lula Tea
- **Business Account:** [WhatsApp Business App]
- **Login:** Phone number verification

### QR Code Location
```
/public/images/whatsapp-barcode.jpg
```

### API Integration
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=966539666654
```

### WhatsApp Web
- **URL:** https://web.whatsapp.com
- **Login:** Scan QR with phone

---

## 💳 STC Pay (Payment)

### Account Details
- **Account Holder:** [Account holder name]
- **Phone:** [STC Pay registered number]
- **Bank:** STC Bank
- **Account Type:** Personal/Business

### QR Code Location
```
/public/images/stc-qr-code.jpg
```

**Note:** This QR code receives payments directly to your STC Pay account.

### Transaction Verification
- **App:** STC Pay Mobile App
- **Login:** [Phone number + PIN/Biometric]
- **View History:** App → Transactions → QR Payments

---

## 🐙 GitHub Repository

### Repository Access
- **URL:** https://github.com/abdulakb/lula-tea-nextjs
- **Owner:** abdulakb
- **Visibility:** Private *(assumed)*

### GitHub Account
- **Username:** abdulakb
- **Email:** [GitHub account email]
- **Password:** `[GITHUB_PASSWORD]`
- **2FA:** [Enabled/Disabled + Recovery codes]

### Personal Access Token (for CLI)
```
Token: [GITHUB_PAT]
Expires: [Expiration date]
Scopes: repo, workflow
```

**Generate New Token:**
GitHub → Settings → Developer settings → Personal access tokens

### Branch Protection
- **Main Branch:** Protected
- **Required Reviews:** [Number]
- **Status Checks:** [Enabled/Disabled]

---

## 🔑 Environment Variables (.env.local)

**Complete `.env.local` file:**

```env
# ============================================
# Supabase Database
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://ktvbmxliscwhmlxlfyly.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SUPABASE_SERVICE_KEY]

# ============================================
# Email Service (Resend)
# ============================================
RESEND_API_KEY=[RESEND_API_KEY]
ADMIN_EMAIL=orders@lulatee.com

# ============================================
# Site Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=https://www.lulatee.com
SITE_URL=https://www.lulatee.com

# For development:
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# SITE_URL=http://localhost:3000

# ============================================
# Admin Authentication
# ============================================
ADMIN_PASSWORD=[ADMIN_PASSWORD]

# ============================================
# WhatsApp Business
# ============================================
NEXT_PUBLIC_WHATSAPP_NUMBER=966539666654

# ============================================
# Analytics (Optional - if using Google Analytics)
# ============================================
# NEXT_PUBLIC_GA_ID=[GA_MEASUREMENT_ID]
```

---

## 🎨 Design Assets

### Logo Files
- **Location:** `/public/icons/`
- **Formats:** PNG, SVG, ICO
- **Sizes:** 
  - `icon-192.png` - 192x192 (Mobile)
  - `icon-512.png` - 512x512 (Desktop)
  - `icon.svg` - Vector (Scalable)
  - `favicon.ico` - Browser tab

### Brand Colors
```css
/* Tailwind Config */
'tea-green': '#769C7C',      /* Primary */
'deep-brown': '#3E2723',     /* Text */
'tea-brown': '#6D4C41',      /* Secondary */
'warm-cream': '#FFF8E1',     /* Background */
```

### Product Images
- **Location:** `/public/images/`
- **Main Product:** `Product Image2.jpg`
- **WhatsApp QR:** `whatsapp-barcode.jpg`
- **STC Pay QR:** `stc-qr-code.jpg`

---

## 📱 Social Media (If applicable)

### Instagram
- **Handle:** [@lulatee]
- **Email:** [Login email]
- **Password:** `[INSTAGRAM_PASSWORD]`

### Twitter/X
- **Handle:** [@lulatee]
- **Email:** [Login email]
- **Password:** `[TWITTER_PASSWORD]`

### Facebook
- **Page:** [Page name]
- **Email:** [Login email]
- **Password:** `[FACEBOOK_PASSWORD]`

---

## 🛠️ Development Tools

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitHub Copilot (optional)
- GitLens

### Package Manager
```bash
npm --version
# Currently using npm (not yarn or pnpm)
```

---

## 📊 Analytics & Monitoring

### Vercel Analytics
- **Included:** Free tier with Vercel hosting
- **Access:** Vercel Dashboard → Project → Analytics

### Custom Analytics
- **Database:** Supabase `analytics_events` table
- **Admin View:** `/admin/analytics`

### Error Tracking (Optional)
If using Sentry or similar:
- **Dashboard:** [URL]
- **DSN:** [Sentry DSN]
- **API Key:** `[SENTRY_API_KEY]`

---

## 🔄 Third-Party Integrations

### Currently Integrated:
✅ Supabase (Database)  
✅ Resend (Email)  
✅ Vercel (Hosting)  
✅ WhatsApp Business (Notifications)  
✅ STC Pay (Payments)  

### Future Integration Ideas:
- Google Analytics
- Stripe (online payments)
- Shipment tracking API
- SMS notifications
- Customer reviews system

---

## 🆘 Emergency Contacts

### Technical Support
- **Developer:** [Your name/email]
- **GitHub Issues:** https://github.com/abdulakb/lula-tea-nextjs/issues

### Service Providers
- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support
- **Resend Support:** https://resend.com/support

### Business Owner
- **Name:** [Owner name]
- **Phone:** +966539666654
- **Email:** orders@lulatee.com

---

## 🔒 Security Checklist

### ✅ Completed
- [x] Environment variables not in Git
- [x] HTTPS enabled (Vercel)
- [x] Database RLS enabled
- [x] Admin password protected
- [x] API keys in environment variables

### 📝 Recommended
- [ ] Enable 2FA on all accounts
- [ ] Regular password rotation (every 90 days)
- [ ] Backup database weekly
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use password manager (1Password, LastPass, Bitwarden)

---

## 📅 Credential Rotation Schedule

| Service | Last Changed | Next Change | Frequency |
|---------|-------------|-------------|-----------|
| Admin Password | [Date] | [Date] | Every 90 days |
| Supabase Password | [Date] | [Date] | Every 6 months |
| GitHub PAT | [Date] | [Date] | Before expiry |
| Resend API Key | [Date] | [Date] | As needed |
| Domain Renewal | N/A | [Date] | Annually |

---

**IMPORTANT REMINDERS:**

1. **Never commit this file to Git**
2. **Store securely** (encrypted drive, password manager)
3. **Share only via secure channels** (encrypted email, secure file transfer)
4. **Update this file** when credentials change
5. **Revoke access** for former team members immediately
6. **Enable 2FA** wherever possible

---

**Document Version:** 1.0  
**Last Updated:** December 4, 2025  
**Next Review:** March 4, 2026
