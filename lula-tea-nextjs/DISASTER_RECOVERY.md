# 🚨 Disaster Recovery Guide - Lula Tea

**Last Updated:** January 1, 2026

This document provides step-by-step instructions for recovering the Lula Tea e-commerce platform in case of critical failures.

---

## 📋 Quick Recovery Checklist

- [ ] Identify what's down (site, database, or both)
- [ ] Check service status pages
- [ ] Follow appropriate recovery procedure below
- [ ] Verify site is working after recovery
- [ ] Document what happened

---

## 🔴 Emergency Contacts & Links

### Service Dashboards
- **Vercel (Hosting):** https://vercel.com/dashboard
- **Supabase (Database):** https://supabase.com/dashboard
- **GitHub (Code):** https://github.com/abdulakb/lula-tea-nextjs
- **Domain Registrar:** Check your DNS provider

### Status Pages
- Vercel Status: https://www.vercel-status.com/
- Supabase Status: https://status.supabase.com/
- GitHub Status: https://www.githubstatus.com/

---

## 🛠️ Recovery Scenarios

### Scenario 1: Site is Down (Vercel Issue)

**Symptoms:** lulatee.com not loading, 502/503 errors

**Steps:**
1. **Check Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Check if deployment failed (red X icon)
   - Look for error messages

2. **Redeploy Last Working Version**
   ```
   1. Vercel Dashboard → Project → Deployments
   2. Find last successful deployment (green checkmark)
   3. Click "..." → "Redeploy"
   4. Wait 2-3 minutes for deployment
   ```

3. **If Redeployment Fails:**
   - Check environment variables are set:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY
     - RESEND_API_KEY
     - ADMIN_EMAIL
   - Check build logs for errors
   - Roll back GitHub to last working commit and redeploy

4. **Emergency: Deploy to New Vercel Project**
   ```
   1. Create new Vercel project
   2. Import GitHub repo: abdulakb/lula-tea-nextjs
   3. Add all environment variables
   4. Deploy
   5. Update DNS to point to new Vercel URL
   ```

---

### Scenario 2: Database Not Working (Supabase Issue)

**Symptoms:** Orders not saving, products not loading, 500 errors

**Steps:**
1. **Check Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Check project status
   - Look for paused/suspended project

2. **Restore from Backup**
   ```
   1. Supabase Dashboard → Database → Backups
   2. Select most recent backup before issue
   3. Click "Restore"
   4. Wait 5-10 minutes
   5. Test site functionality
   ```

3. **If Backup Restore Fails:**
   - Check if database quota exceeded
   - Verify service role key is valid
   - Check RLS policies aren't blocking queries

4. **Emergency: Create New Supabase Project**
   ```
   1. Create new Supabase project
   2. Copy database URL and keys
   3. Run all migrations from supabase/migrations/ folder
   4. Import data from CSV backups (see Data Recovery section)
   5. Update Vercel environment variables with new keys
   6. Redeploy site
   ```

---

### Scenario 3: GitHub Repository Lost

**Symptoms:** Cannot access code, Git push fails

**Steps:**
1. **Restore from Local Copy**
   ```bash
   # Your local machine has the latest code
   cd C:\Users\akbah\Dev\Sandbox-python\lula-tea-nextjs
   git status  # Check you have latest changes
   
   # Create new GitHub repository
   # Then push to new repo:
   git remote set-url origin https://github.com/NEW-REPO-URL
   git push -u origin main
   ```

2. **Reconnect Vercel to New Repo**
   ```
   1. Vercel Dashboard → Project → Settings
   2. Git → Connect to new GitHub repository
   3. Redeploy
   ```

---

### Scenario 4: Complete System Failure

**If everything is down, rebuild from scratch:**

**Step 1: Database Recovery**
```
1. Create new Supabase project
2. Run migrations:
   - 001_initial_schema.sql (if exists)
   - 002_customers.sql
   - 003_orders.sql
   - 012_add_city_stock_fixed.sql
   - 013_add_order_history.sql
3. Import CSV backups (orders, customers, products)
```

**Step 2: Code Recovery**
```
1. Create new GitHub repo from local code
2. Push code: git push -u origin main
```

**Step 3: Hosting Recovery**
```
1. Create new Vercel project
2. Connect to GitHub repo
3. Add environment variables (see below)
4. Deploy
```

**Step 4: DNS Update**
```
1. Go to your domain registrar
2. Update A/CNAME records to point to new Vercel deployment
3. Wait 1-24 hours for DNS propagation
```

---

## 🔑 Critical Environment Variables

**Store these securely offline!**

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

### Resend (Email)
```
RESEND_API_KEY=[YOUR-RESEND-KEY]
ADMIN_EMAIL=lula.tea@outlook.com
```

### Optional
```
SITE_URL=https://www.lulatee.com
NEXT_PUBLIC_ENABLE_EMAILS=true
```

**⚠️ Where to get these if lost:**
- Supabase keys: Supabase Dashboard → Project Settings → API
- Resend key: https://resend.com/api-keys
- Must regenerate if lost!

---

## 💾 Data Backup Procedures

### Weekly Manual Backup (Recommended)

**Export Critical Data:**
```sql
-- In Supabase SQL Editor

-- Export orders
COPY (SELECT * FROM orders ORDER BY created_at DESC) 
TO STDOUT WITH CSV HEADER;
-- Save output as orders_YYYYMMDD.csv

-- Export customers  
COPY (SELECT * FROM customers WHERE verified = true ORDER BY created_at DESC)
TO STDOUT WITH CSV HEADER;
-- Save output as customers_YYYYMMDD.csv

-- Export products
COPY (SELECT * FROM products ORDER BY name)
TO STDOUT WITH CSV HEADER;
-- Save output as products_YYYYMMDD.csv
```

**Storage Locations:**
1. Local: `C:\Users\akbah\Dev\Backups\lula-tea\`
2. Cloud: Google Drive, OneDrive, or Dropbox
3. External: USB drive (keep separate from computer)

---

## 📊 Data Import (If Restoring from CSV)

### Import Orders
```sql
-- In new Supabase SQL Editor
COPY orders (
  order_id, customer_id, customer_name, customer_email, customer_phone,
  customer_address, building_number, gps_coordinates, delivery_city,
  items, subtotal, delivery_fee, total, payment_method, status, 
  created_at, order_date
)
FROM '/path/to/orders_backup.csv'
WITH (FORMAT csv, HEADER true);
```

### Import Customers
```sql
COPY customers (
  phone, name, email, delivery_address, building_number, 
  verified, created_at
)
FROM '/path/to/customers_backup.csv'
WITH (FORMAT csv, HEADER true);
```

### Import Products
```sql
COPY products (
  name, name_ar, description, description_ar, price, 
  total_stock, riyadh_stock, jeddah_stock, image_url
)
FROM '/path/to/products_backup.csv'
WITH (FORMAT csv, HEADER true);
```

---

## 🔍 Health Check After Recovery

Test these features after any recovery:

### Critical Functions ✅
- [ ] Homepage loads
- [ ] Product page displays
- [ ] Cart adds items
- [ ] Checkout page works
- [ ] Orders can be placed
- [ ] Admin login works
- [ ] Admin can view orders
- [ ] Admin can update order status
- [ ] Admin can edit order amounts

### Test Order Flow
```
1. Add 2 packs to cart
2. Go to checkout
3. Enter test address with "Riyadh" 
4. Verify delivery fee is 20 SAR
5. Place order (Cash on Delivery)
6. Check order appears in admin portal
7. Update order status to "delivered"
8. Verify customer can see order status
```

---

## 📞 When to Call for Help

**Immediate escalation needed if:**
- Customer orders are being lost
- Payments processed but orders not recorded
- Data corruption detected
- Security breach suspected
- Can't recover within 2 hours

**Support Resources:**
- Vercel Support: https://vercel.com/help
- Supabase Support: support@supabase.com
- GitHub Support: https://support.github.com

---

## 🎯 Prevention Tips

### Regular Maintenance
- [ ] Weekly: Check Vercel deployments are successful
- [ ] Weekly: Export database to CSV
- [ ] Monthly: Test backup restoration
- [ ] Monthly: Verify environment variables
- [ ] Quarterly: Review and update this document

### Monitoring Setup
1. **Vercel:** Enable deployment notifications (email/Slack)
2. **Supabase:** Set up usage alerts (90% quota warning)
3. **Domain:** Enable expiration reminders

### Access Management
- Keep passwords in secure password manager
- Document who has access to each service
- Store recovery codes safely
- Keep 2FA backup codes offline

---

## 📝 Incident Log Template

**After any recovery, document what happened:**

```
Date: YYYY-MM-DD HH:MM
Incident: [Brief description]
Duration: [How long site was down]
Affected: [What was impacted]
Root Cause: [Why it happened]
Resolution: [What fixed it]
Prevention: [How to avoid in future]
```

Store logs in: `HANDOVER_PACKAGE/INCIDENT_LOGS/`

---

## 🚀 Quick Reference Commands

### Check Site Status
```bash
# Test if site is up
curl -I https://www.lulatee.com

# Check Vercel deployment
vercel ls

# Check git status
git status
git log --oneline -10
```

### Emergency Redeploy
```bash
# From project directory
cd C:\Users\akbah\Dev\Sandbox-python\lula-tea-nextjs

# Pull latest
git pull origin main

# Push to trigger deploy
git commit --allow-empty -m "Emergency redeploy"
git push origin main
```

### Database Health Check
```sql
-- Check table counts
SELECT 'orders' as table, COUNT(*) as count FROM orders
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'products', COUNT(*) FROM products;

-- Check recent orders
SELECT order_id, customer_name, total, status, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📎 Additional Resources

- **Setup Guide:** `HANDOVER_PACKAGE/QUICK_START.md`
- **Database Schema:** `supabase/migrations/`
- **API Documentation:** `HANDOVER_PACKAGE/ASSETS_INVENTORY.md`
- **Credentials:** `HANDOVER_PACKAGE/CREDENTIALS.md` (keep secure!)

---

**Remember:** Stay calm, follow the checklist, and document everything. Most issues can be resolved within 30 minutes if you follow these procedures systematically.

**🆘 Emergency Contact:** If you need immediate technical assistance, refer to the contacts in `HANDOVER_PACKAGE/README.md`
