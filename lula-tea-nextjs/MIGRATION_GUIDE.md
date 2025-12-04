# Database Migrations - Run Order

## ⚠️ Important: Run in This Order!

You need to run these migrations in your Supabase SQL Editor in this exact order:

### ✅ Already Run (Check if these exist):
1. `001_create_orders_table.sql` - Orders table
2. `002_create_analytics_table.sql` - Analytics tracking
3. `003_add_order_details.sql` - Additional order fields
4. `004_add_order_notes.sql` - Order notes/comments

### 🔄 Need to Run Now:

#### **Migration 005: Create Products Table** ⭐ START HERE
**File:** `supabase/migrations/005_create_products_table.sql`

**What it does:**
- Creates the `products` table
- Adds sample products (5 tea products)
- Sets up Row Level Security
- Creates indexes for performance

**How to run:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire content from `005_create_products_table.sql`
3. Click "Run"
4. ✅ You should see: "Success. No rows returned"

---

#### **Migration 007: Add Inventory Management** ⭐ RUN SECOND
**File:** `supabase/migrations/007_add_inventory_management.sql`

**What it does:**
- Adds `track_inventory` and `allow_backorder` columns to products
- Creates `stock_movements` table to track all inventory changes
- Creates `deduct_product_stock()` function - automatically deducts stock on orders
- Creates `restock_product()` function - add stock back manually
- Adds a sample product with 100 stock

**How to run:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire content from `007_add_inventory_management.sql`
3. Click "Run"
4. ✅ You should see: "Success. No rows returned"

---

#### **Migration 008: Add Transaction Reference** ⭐ RUN THIRD
**File:** `supabase/migrations/008_add_transaction_reference.sql`

**What it does:**
- Adds `transaction_reference` column to orders table
- Creates index for fast transaction lookups
- Allows storing STC Pay transaction IDs from customer SMS

**How to run:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire content from `008_add_transaction_reference.sql`
3. Click "Run"
4. ✅ You should see: "Success. No rows returned"

---

## 🔍 How to Check If Migrations Ran Successfully:

### Check Products Table:
```sql
SELECT * FROM products LIMIT 5;
```
You should see 5-6 products.

### Check Stock Movements Table:
```sql
SELECT * FROM stock_movements LIMIT 10;
```
Should be empty initially (will populate when orders are placed).

### Check Orders Table Has Transaction Reference:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'transaction_reference';
```
Should return one row showing the column exists.

### Test Inventory Functions:
```sql
-- Get a product ID first
SELECT id, name, stock_quantity FROM products LIMIT 1;

-- Test deduct function (replace UUID with actual product ID)
SELECT deduct_product_stock(
  'YOUR-PRODUCT-UUID-HERE'::uuid,
  5,
  'TEST-ORDER-123'
);
```

---

## 🚨 Common Errors:

### "relation 'products' does not exist"
**Solution:** Run migration 005 first!

### "column 'track_inventory' already exists"
**Solution:** Migration 007 was already run. Skip it.

### "function deduct_product_stock already exists"
**Solution:** Migration 007 was already run. You can re-run it safely (it uses `CREATE OR REPLACE`).

---

## 📊 After All Migrations Are Complete:

Your database will have:
- ✅ Orders with transaction reference tracking
- ✅ Products with inventory management
- ✅ Automatic stock deduction on orders
- ✅ Stock movement history tracking
- ✅ Low stock alerts

Test by placing an order on your website and checking if stock decreases!
