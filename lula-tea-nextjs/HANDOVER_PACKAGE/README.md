# 🍵 Lula Tea - Complete Business & Technical Documentation

## 📋 Table of Contents
1. [Business Overview](#business-overview)
2. [Quick Access Links](#quick-access-links)
3. [Credentials & Access](#credentials--access)
4. [Technical Architecture](#technical-architecture)
5. [Key Features](#key-features)
6. [For New Developers](#for-new-developers)

---

## 🏢 Business Overview

**Business Name:** Lula Tea  
**Tagline:** Homemade with Love  
**Product:** Premium Loose Leaf Tea Blend (200g packs)  
**Price:** 60 SAR per pack  
**Current Inventory:** 8 bags (as of Dec 4, 2025)  
**Business Model:** Direct-to-consumer tea sales with delivery in Riyadh/Jeddah

### Owner Information
- **Name:** [Owner Name]
- **Phone:** 966539666654 (WhatsApp Business)
- **Email:** orders@lulatee.com
- **Location:** VJFG+67J, Al Aarid, Riyadh 13338 (Warehouse)

### Product Details
- **SKU:** LULA-TEA-001
- **Weight:** 200g per pack
- **Low Stock Alert:** 5 bags
- **Backorder:** Not allowed (prevents overselling)

### Initial Inventory Setup
- Started with: 20 bags
- Promotional distribution: 10 bags (marketing campaign)
- First sale: 2 bags (Customer: Rawan, Order: LT1764855293254)
- **Current Stock:** 8 bags

---

## 🔗 Quick Access Links

### Live Website
- **Production URL:** https://www.lulatee.com
- **Hosted on:** Vercel (Washington DC - iad1 region)

### Admin Panel
- **URL:** https://www.lulatee.com/admin
- **Username:** admin
- **Password:** [See CREDENTIALS.md]

### Admin Pages
- Dashboard: `/admin`
- Orders: `/admin/orders`
- Order Details: `/admin/orders/[id]`
- Analytics: `/admin/analytics`
- Products: `/admin/products`

### Development
- **GitHub Repository:** https://github.com/abdulakb/lula-tea-nextjs
- **Branch:** main
- **Framework:** Next.js 16.0.3 with App Router

---

## 🔐 Credentials & Access

> **⚠️ SECURITY NOTE:** All sensitive credentials are stored in separate files.  
> See `CREDENTIALS.md` and `.env.local` for complete access details.

### Essential Services

#### 1. **GitHub**
- Repository: abdulakb/lula-tea-nextjs
- Access: [See CREDENTIALS.md]

#### 2. **Vercel (Hosting)**
- Project: lula-tea-nextjs
- Region: Washington DC (iad1)
- Auto-deploys from GitHub main branch
- Dashboard: vercel.com/[account]

#### 3. **Supabase (Database)**
- Project: ktvbmxliscwhmlxlfyly
- Database: PostgreSQL
- URL: ktvbmxliscwhmlxlfyly.supabase.co
- API Keys: [See CREDENTIALS.md]

#### 4. **Resend (Email Service)**
- From Email: orders@lulatee.com
- API Key: [See CREDENTIALS.md]
- Dashboard: resend.com

#### 5. **WhatsApp Business**
- Number: +966539666654
- QR Code: `/public/images/whatsapp-barcode.jpg`
- Link Format: `https://wa.me/966539666654`

#### 6. **STC Pay (Payment)**
- QR Code: `/public/images/stc-qr-code.jpg`
- Payment receiver: [Owner's STC Pay account]

---

## 🏗️ Technical Architecture

### Tech Stack
```
Frontend:
├── Next.js 16.0.3 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS
└── Turbopack (dev server)

Backend:
├── Next.js API Routes
├── Supabase PostgreSQL
└── Server Actions

Services:
├── Vercel (Hosting)
├── Supabase (Database)
├── Resend (Email)
├── WhatsApp Business API
└── STC Pay (QR Payment)
```

### Database Schema

**Tables:**
1. `orders` - Customer orders with all details
2. `products` - Product catalog with inventory
3. `stock_movements` - Audit trail for inventory changes
4. `order_notes` - Admin notes on orders
5. `analytics_events` - User behavior tracking

**Key Functions:**
- `deduct_product_stock()` - Automatic stock deduction
- `restock_product()` - Manual inventory addition
- Row Level Security (RLS) enabled on all tables

### Project Structure
```
lula-tea-nextjs/
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── admin/                      # Admin portal
│   │   ├── page.tsx               # Dashboard
│   │   ├── orders/                # Order management
│   │   ├── analytics/             # Analytics
│   │   └── products/              # Product management
│   ├── api/                        # API routes
│   │   ├── orders/create/         # Create order
│   │   ├── products/              # Products API
│   │   ├── emails/send/           # Email sending
│   │   └── analytics/track/       # Event tracking
│   ├── checkout/                   # Checkout flow
│   ├── components/                 # Shared components
│   └── [other pages]/
├── context/
│   ├── CartContext.tsx            # Shopping cart state
│   ├── LanguageContext.tsx        # i18n (Arabic/English)
│   └── AnalyticsContext.tsx       # Event tracking
├── lib/
│   ├── supabaseClient.ts          # Database connection
│   ├── invoiceGenerator.ts        # PDF invoices
│   ├── emailTemplates.ts          # Email templates
│   ├── whatsapp.ts                # WhatsApp helpers
│   └── adminAuth.ts               # Admin authentication
├── supabase/migrations/           # Database migrations
├── public/
│   └── images/                    # Logo, products, QR codes
└── [config files]
```

---

## ✨ Key Features

### Customer-Facing Features

#### 1. **Bilingual Support** (Arabic/English)
- Auto-detects language preference
- Seamless switching with flag toggle
- All content translated

#### 2. **Product Display**
- Real-time stock levels
- Stock badges (In Stock / Low Stock / Out of Stock)
- Prevents orders exceeding available stock
- Auto-updates after each order

#### 3. **Shopping Cart**
- Persistent across sessions
- Quantity adjustment
- Real-time total calculation
- Item removal

#### 4. **Checkout System**
Three payment methods:
- **Cash on Delivery** - Traditional payment
- **STC Pay QR Code** - Instant bank transfer with transaction reference tracking
- **WhatsApp Order** - Direct messaging

**Checkout Features:**
- Customer info collection
- GPS location picker
- Delivery time preferences
- Delivery notes
- Free delivery eligibility (based on location/quantity)

#### 5. **Order Confirmation**
- PDF invoice generation
- Email confirmation (if provided)
- WhatsApp notification with invoice
- Order tracking number

#### 6. **Dark Mode**
- System-wide dark theme
- Toggle on all pages
- Persistent preference

### Admin Features

#### 1. **Dashboard** (`/admin`)
- Total revenue
- Orders by status (Pending/Processing/Shipped/Delivered/Cancelled)
- Recent orders
- Quick stats
- Date period filtering

#### 2. **Order Management** (`/admin/orders`)
- List all orders
- Search/filter by status, customer, date
- Bulk actions (status update, delete)
- Order details view:
  - Customer information
  - Items ordered
  - Payment method & transaction reference
  - Delivery address with GPS
  - Order timeline
  - Admin notes

#### 3. **Product Management** (`/admin/products`)
- View all products
- Real-time stock levels
- Low stock alerts
- Inventory value calculation
- Out of stock tracking

#### 4. **Analytics** (`/admin/analytics`)
- Page views
- Add to cart events
- Purchase completions
- Event tracking

#### 5. **Inventory System**
**Automatic Features:**
- Stock deduction on order
- Prevents overselling
- Low stock alerts (at 5 bags)
- Out of stock auto-marking
- Complete audit trail

**Stock Movement Types:**
- Sale (automatic on order)
- Restock (manual addition)
- Adjustment (corrections)
- Return (customer returns)

**Tracking:**
- Every change recorded
- Shows before/after quantities
- Links to order IDs
- Timestamps and who made change

#### 6. **Transaction Verification** (STC Pay)
- Customer enters transaction reference from bank SMS
- Displayed prominently in order details
- Copy button for easy verification
- Match with STC Pay transaction history

---

## 👨‍💻 For New Developers

### Getting Started

#### 1. **Clone Repository**
```bash
git clone https://github.com/abdulakb/lula-tea-nextjs.git
cd lula-tea-nextjs
```

#### 2. **Install Dependencies**
```bash
npm install
```

#### 3. **Environment Setup**
Create `.env.local` file (see `ENV_TEMPLATE.md` for all variables):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ktvbmxliscwhmlxlfyly.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[see CREDENTIALS.md]

# Resend Email
RESEND_API_KEY=[see CREDENTIALS.md]
ADMIN_EMAIL=orders@lulatee.com

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# Admin
ADMIN_PASSWORD=[see CREDENTIALS.md]

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=966539666654
```

#### 4. **Run Development Server**
```bash
npm run dev
```
Visit `http://localhost:3000`

#### 5. **Run Database Migrations**
See `MIGRATION_GUIDE.md` for step-by-step instructions.

Must run in order:
1. `001_create_orders_table.sql`
2. `002_create_analytics_table.sql`
3. `003_add_order_details.sql`
4. `004_add_order_notes.sql`
5. `005_create_products_table.sql`
6. `006_clear_test_data.sql` (optional)
7. `007_add_inventory_management.sql` ⭐
8. `008_add_transaction_reference.sql` ⭐
9. `009_set_actual_inventory.sql` ⭐

### Key Files to Understand

#### **Context Providers** (Global State)
- `context/CartContext.tsx` - Shopping cart
- `context/LanguageContext.tsx` - Arabic/English switching
- `context/AnalyticsContext.tsx` - Event tracking

#### **API Routes**
- `app/api/orders/create/route.ts` - Order creation + stock deduction
- `app/api/products/route.ts` - Fetch products with stock
- `app/api/emails/send/route.ts` - Send emails via Resend

#### **Core Libraries**
- `lib/supabaseClient.ts` - Database connection
- `lib/invoiceGenerator.ts` - PDF generation (React-PDF)
- `lib/whatsapp.ts` - WhatsApp message formatting

#### **Admin Authentication**
- `lib/adminAuth.ts` - Simple password-based auth
- Stored in browser localStorage
- Check with `isAdminAuthenticated()`

### Common Tasks

#### **Add New Product**
```sql
INSERT INTO products (name, name_ar, description, description_ar, price, stock_quantity, low_stock_threshold, category, sku, track_inventory)
VALUES ('New Tea', 'شاي جديد', 'Description', 'الوصف', 50.00, 100, 20, 'Tea', 'TEA-NEW-001', true);
```

#### **Restock Product**
```sql
SELECT restock_product(
  'product-uuid'::uuid,
  50,  -- quantity to add
  'Restocked from supplier',
  'admin'
);
```

#### **View Stock History**
```sql
SELECT * FROM stock_movements 
WHERE product_id = 'product-uuid'
ORDER BY created_at DESC;
```

#### **Update Admin Password**
Edit `.env.local`:
```env
ADMIN_PASSWORD=your_new_password
```
Redeploy to Vercel.

### Troubleshooting

#### **Stock not deducting:**
- Check `app/api/orders/create/route.ts`
- Verify `deduct_product_stock()` function exists in Supabase
- Check logs: `supabase` → `Logs` → `Postgres`

#### **Emails not sending:**
- Verify Resend API key in env variables
- Check sender email is verified: orders@lulatee.com
- View logs in Resend dashboard

#### **Admin login not working:**
- Clear browser localStorage
- Check `ADMIN_PASSWORD` in Vercel environment variables
- Verify in `lib/adminAuth.ts`

#### **Out of sync inventory:**
- Run stock verification query
- Check `stock_movements` table for missing records
- Manually adjust with `restock_product()` or direct UPDATE

### Deployment

**Automatic Deployment:**
- Push to `main` branch on GitHub
- Vercel automatically builds and deploys
- Takes ~2-3 minutes

**Manual Deployment:**
```bash
# Via Vercel CLI
vercel --prod
```

**Environment Variables:**
- Set in Vercel Dashboard → Settings → Environment Variables
- Must match `.env.local` exactly
- Redeploy after changing

### Performance Optimization

#### **Already Implemented:**
- Image optimization (Next.js Image)
- Code splitting (automatic)
- API route caching
- Database indexes on frequent queries
- Turbopack for faster dev builds

#### **Future Improvements:**
- Add Redis for session management
- Implement ISR (Incremental Static Regeneration)
- Add CDN for static assets
- Optimize images with WebP format
- Add service worker for offline support

### Security Best Practices

#### **Current Security:**
✅ Row Level Security (RLS) on database  
✅ Environment variables for secrets  
✅ HTTPS only (Vercel)  
✅ Input validation on forms  
✅ SQL injection prevention (parameterized queries)  
✅ XSS prevention (React escaping)  

#### **Recommendations:**
- [ ] Add rate limiting on API routes
- [ ] Implement CSRF tokens
- [ ] Add 2FA for admin login
- [ ] Set up security headers
- [ ] Regular dependency updates
- [ ] Automated security scanning

---

## 📞 Support Contacts

### Technical Issues
- Repository: https://github.com/abdulakb/lula-tea-nextjs/issues
- Email: [Developer email]

### Business Inquiries
- WhatsApp: +966539666654
- Email: orders@lulatee.com

### Service Providers
- Vercel Support: vercel.com/support
- Supabase Support: supabase.com/support
- Resend Support: resend.com/support

---

## 📚 Additional Documentation

See the following files in the handover package:

1. **CREDENTIALS.md** - All passwords and API keys
2. **ENV_TEMPLATE.md** - Environment variable setup
3. **MIGRATION_GUIDE.md** - Database setup instructions
4. **INVENTORY_SYSTEM.md** - Stock management guide
5. **API_DOCUMENTATION.md** - API endpoints reference
6. **GITHUB_COPILOT_PROMPT.md** - AI assistant configuration
7. **ASSETS_INVENTORY.md** - All images, logos, and files

---

**Last Updated:** December 4, 2025  
**Version:** 1.0.0  
**Maintained By:** [Current Developer]
