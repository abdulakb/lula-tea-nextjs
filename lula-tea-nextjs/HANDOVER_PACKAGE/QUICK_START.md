# 🚀 Quick Start Guide for New Developer

Welcome to the Lula Tea project! This guide will get you up and running in 30 minutes.

---

## ⏱️ 30-Minute Setup

### Step 1: Get Access (5 minutes)

#### Required Accounts
- [ ] GitHub account added to repository
- [ ] Vercel account access (if managing deployment)
- [ ] Supabase project access
- [ ] Resend account access (email)
- [ ] Review CREDENTIALS.md (securely shared)

#### Download
```bash
git clone https://github.com/abdulakb/lula-tea-nextjs.git
cd lula-tea-nextjs
```

---

### Step 2: Install Dependencies (3 minutes)

```bash
# Install Node.js packages
npm install

# Check Node.js version (should be 18+ or 20+)
node --version
```

**If you get errors:**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### Step 3: Environment Setup (5 minutes)

Create `.env.local` file in project root:

```env
# Copy from CREDENTIALS.md
NEXT_PUBLIC_SUPABASE_URL=https://ktvbmxliscwhmlxlfyly.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from CREDENTIALS.md]

RESEND_API_KEY=[from CREDENTIALS.md]
ADMIN_EMAIL=orders@lulatee.com

NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000

ADMIN_PASSWORD=[from CREDENTIALS.md]

NEXT_PUBLIC_WHATSAPP_NUMBER=966539666654
```

**Where to find values:**
- All in `CREDENTIALS.md` file (securely shared)
- Supabase: Dashboard → Project Settings → API
- Resend: Dashboard → API Keys
- Admin Password: Set by owner

---

### Step 4: Run Development Server (2 minutes)

```bash
npm run dev
```

Visit: http://localhost:3000

**You should see:**
- ✅ Lula Tea homepage
- ✅ Product with "Stock: 8" badge
- ✅ Language switcher (English/Arabic)
- ✅ Dark mode toggle

**If it doesn't work:**
- Check console for errors
- Verify `.env.local` exists
- Check all environment variables are set

---

### Step 5: Test Admin Access (3 minutes)

1. Visit: http://localhost:3000/admin
2. Enter password (from CREDENTIALS.md)
3. Should see dashboard with:
   - Total revenue
   - Order statistics
   - Recent orders

**Test Features:**
- [ ] View orders
- [ ] View products
- [ ] Check inventory (should show 8 bags)
- [ ] View analytics

---

### Step 6: Database Verification (5 minutes)

#### Check Migrations Status

**Option A: Supabase Dashboard**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run this query:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should see:
-- orders
-- products
-- stock_movements
-- order_notes
-- analytics_events
```

**Option B: Check Product Stock**
```sql
SELECT name, stock_quantity, available 
FROM products 
WHERE sku = 'LULA-TEA-001';

-- Should return: 8 stock
```

**If migrations not run:**
See `MIGRATION_GUIDE.md` for complete instructions.

---

### Step 7: Test Order Flow (7 minutes)

#### Place Test Order

1. **Add to Cart**
   - Go to homepage
   - Select quantity (try 2)
   - Click "Add to Cart"
   - Check cart badge shows "2"

2. **Checkout**
   - Go to cart
   - Click "Proceed to Checkout"
   - Fill in test customer info:
     ```
     Name: Test Customer
     Phone: 0512345678
     Address: Test Address, Riyadh
     Time: Morning
     ```

3. **Select Payment**
   - Choose "Cash on Delivery"
   - Click "Confirm Order"

4. **Verify**
   - Should redirect to order confirmation
   - Check admin panel → Orders
   - Should see new order
   - **Check stock:** Should be 6 now (8 - 2 = 6)

---

## ✅ Verification Checklist

After setup, verify everything works:

### Frontend
- [ ] Homepage loads
- [ ] Product displays with stock badge
- [ ] Language switcher works (EN ↔ AR)
- [ ] Dark mode toggle works
- [ ] Can add items to cart
- [ ] Cart persists on refresh
- [ ] Checkout form validates

### Admin Panel
- [ ] Can login
- [ ] Dashboard shows data
- [ ] Can view all orders
- [ ] Can view order details
- [ ] Can view products
- [ ] Stock quantities correct

### Database
- [ ] All tables exist
- [ ] Products table has data
- [ ] Current stock = 8 bags
- [ ] stock_movements table exists

### APIs
- [ ] Can create orders
- [ ] Stock deducts automatically
- [ ] Emails send (check Resend dashboard)
- [ ] WhatsApp links work

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Supabase error"
```bash
# Check environment variables
cat .env.local | grep SUPABASE

# Verify in Supabase Dashboard → Settings → API
```

### Issue: "Can't login to admin"
```bash
# Check password in .env.local
cat .env.local | grep ADMIN_PASSWORD

# Try clearing browser localStorage
# In browser console:
localStorage.clear()
```

### Issue: "Stock not deducting"
```sql
-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'deduct_product_stock';

-- If not found, run migration 007
```

### Issue: "Emails not sending"
```bash
# Check Resend API key
cat .env.local | grep RESEND

# Check Resend dashboard for errors
# Visit: resend.com/overview
```

---

## 📚 Next Steps

### Learn the Codebase (1 hour)

#### 1. **Read Documentation**
- [ ] README.md - Complete overview
- [ ] MIGRATION_GUIDE.md - Database setup
- [ ] INVENTORY_SYSTEM.md - Stock management
- [ ] GITHUB_COPILOT_PROMPT.md - Coding guidelines

#### 2. **Explore Key Files**
```
app/
├── page.tsx              # Homepage
├── checkout/page.tsx     # Checkout flow
├── admin/                # Admin portal
│   ├── page.tsx         # Dashboard
│   └── orders/page.tsx  # Order management
├── api/
│   └── orders/create/   # Order creation API
└── components/
    └── ProductCard.tsx  # Main product display

context/
├── CartContext.tsx       # Shopping cart
└── LanguageContext.tsx   # Arabic/English

lib/
├── supabaseClient.ts     # Database
├── invoiceGenerator.ts   # PDF invoices
└── emailTemplates.ts     # Email formatting
```

#### 3. **Understand Data Flow**
```
Customer adds to cart
    ↓
CartContext stores items
    ↓
Checkout page collects info
    ↓
API: /api/orders/create
    ↓
1. Validate input
2. Generate invoice PDF
3. Deduct stock (Supabase function)
4. Save order to database
5. Send email (Resend)
6. Send WhatsApp notification
    ↓
Redirect to confirmation
```

### Make First Change (30 minutes)

Try a simple task to understand the workflow:

#### Task: Change Low Stock Threshold

1. **Update in Database:**
```sql
UPDATE products 
SET low_stock_threshold = 3 
WHERE sku = 'LULA-TEA-001';
```

2. **Test:**
- Place order to reduce stock to 3 or below
- Check if "Low Stock" badge appears
- Verify in admin panel

3. **Commit:**
```bash
git add .
git commit -m "Update low stock threshold to 3"
git push
```

---

## 🎯 Your First Week Goals

### Day 1: Setup & Understanding
- [ ] Complete this quick start guide
- [ ] Run local development server
- [ ] Place test order
- [ ] Explore admin panel
- [ ] Read all documentation

### Day 2: Code Exploration
- [ ] Review main components
- [ ] Understand cart system
- [ ] Study order creation flow
- [ ] Review database schema
- [ ] Test inventory system

### Day 3: First Enhancement
- [ ] Choose small feature to add
- [ ] Make changes locally
- [ ] Test thoroughly
- [ ] Commit and push
- [ ] Verify on Vercel

### Day 4-5: Deep Dive
- [ ] Understand bilingual system
- [ ] Study admin authentication
- [ ] Review analytics tracking
- [ ] Explore email templates
- [ ] Test all payment methods

---

## 📞 Getting Help

### Resources
1. **Documentation** - Read all `.md` files in HANDOVER_PACKAGE
2. **Code Comments** - Many functions have inline explanations
3. **GitHub Issues** - Check existing issues/discussions
4. **Owner Contact** - WhatsApp: +966539666654

### Before Asking
- [ ] Read relevant documentation
- [ ] Check console for errors
- [ ] Try suggested solutions
- [ ] Search GitHub issues
- [ ] Test in isolation

### When Asking
Include:
- What you're trying to do
- What you expected
- What actually happened
- Error messages (full text)
- Steps to reproduce
- Screenshots if helpful

---

## 🎉 You're Ready!

Once you've completed this guide, you're ready to:
- ✅ Make code changes
- ✅ Fix bugs
- ✅ Add features
- ✅ Manage orders
- ✅ Update inventory
- ✅ Deploy to production

**Welcome to the team! 🍵**

---

**Document Version:** 1.0  
**Last Updated:** December 4, 2025  
**Estimated Setup Time:** 30 minutes  
**Estimated Learning Time:** 1-2 days
