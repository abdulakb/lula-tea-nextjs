# 🤖 GitHub Copilot Instructions for Lula Tea Project

> **Purpose:** This file contains instructions for GitHub Copilot to help maintain and enhance the Lula Tea e-commerce website.  
> **Location:** Place this in `.github/copilot-instructions.md` in your repository

---

## Project Context

You are working on **Lula Tea**, an e-commerce website for a premium tea business in Saudi Arabia. The site sells loose leaf tea blends with delivery in Riyadh and Jeddah.

### Tech Stack
- **Frontend:** Next.js 16.0.3, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase PostgreSQL
- **Hosting:** Vercel (iad1 region)
- **Email:** Resend API
- **Payments:** Cash on Delivery, STC Pay QR, WhatsApp Orders
- **Language:** Bilingual (Arabic & English)

---

## Code Style & Conventions

### TypeScript
```typescript
// Always use TypeScript interfaces for data structures
interface Order {
  id: string;
  customer_name: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

// Use explicit return types
async function fetchOrders(): Promise<Order[]> {
  // implementation
}

// Prefer const over let
const items = [];
```

### React Components
```typescript
// Use functional components with TypeScript
export default function ComponentName() {
  const [state, setState] = useState<Type>(initialValue);
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// Use proper imports
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // App Router
```

### Naming Conventions
- **Files:** PascalCase for components (`ProductCard.tsx`), camelCase for utilities (`productData.ts`)
- **Components:** PascalCase (`ProductCard`, `CheckoutPage`)
- **Functions:** camelCase (`handleSubmit`, `fetchProducts`)
- **Variables:** camelCase (`customerName`, `totalPrice`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_QUANTITY`)
- **CSS Classes:** kebab-case with Tailwind utilities

---

## Bilingual Support

### CRITICAL: Always support both Arabic and English

```typescript
// ✅ CORRECT: Use translation context
const { language, t } = useLanguage();

return (
  <h1>{t("welcomeMessage")}</h1>
);

// ❌ INCORRECT: Hardcoded English only
return (
  <h1>Welcome to Lula Tea</h1>
);
```

### Translation Pattern
```typescript
// For UI text
{language === "ar" ? "نص عربي" : "English text"}

// For dynamic content
{language === "ar" ? product.nameAr : product.name}

// For currency
{language === "ar" ? `${price} ريال` : `${price} SAR`}
```

### RTL Support
```typescript
// Add dir attribute for Arabic
<div dir={language === "ar" ? "rtl" : "ltr"}>
  {/* Content */}
</div>

// Text alignment
<p className="text-right" dir="rtl">  // For Arabic
<p className="text-left" dir="ltr">   // For English
```

---

## Database Operations

### Supabase Client Usage
```typescript
import { supabase } from "@/lib/supabaseClient";

// Fetching data
const { data, error } = await supabase
  .from("orders")
  .select("*")
  .eq("status", "pending")
  .order("created_at", { ascending: false });

if (error) {
  console.error("Error:", error);
  return;
}

// Inserting data
const { data: newOrder, error: insertError } = await supabase
  .from("orders")
  .insert([{
    customer_name: "John",
    total: 120.00,
    // ...
  }])
  .select();
```

### Inventory Management
**IMPORTANT:** Always use the `deduct_product_stock()` function for stock deduction:

```typescript
// ✅ CORRECT: Use the database function
const { data, error } = await supabase.rpc('deduct_product_stock', {
  p_product_id: productId,
  p_quantity: quantity,
  p_order_id: orderId
});

if (!data.success) {
  // Handle insufficient stock
  return { error: data.error };
}

// ❌ INCORRECT: Direct UPDATE (bypasses stock tracking)
await supabase
  .from('products')
  .update({ stock_quantity: newStock })
  .eq('id', productId);
```

---

## API Routes

### Standard Pattern
```typescript
// app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.required_field) {
      return NextResponse.json(
        { error: "Missing required field" },
        { status: 400 }
      );
    }

    // Business logic
    const result = await processData(body);

    // Success response
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Styling Guidelines

### Tailwind CSS
```typescript
// ✅ Preferred: Use Tailwind utilities
<button className="bg-tea-green hover:bg-tea-green/90 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-lg">
  Click Me
</button>

// Custom colors (defined in tailwind.config)
'tea-green': '#769C7C',
'deep-brown': '#3E2723',
'tea-brown': '#6D4C41',
'warm-cream': '#FFF8E1',
```

### Dark Mode Support
**ALWAYS include dark mode variants:**

```typescript
// ✅ CORRECT: Dark mode support
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// ❌ INCORRECT: Light mode only
<div className="bg-white text-gray-900">
```

### Responsive Design
```typescript
// Mobile-first approach
<div className="w-full md:w-1/2 lg:w-1/3">
  
// Common breakpoints
className="text-sm sm:text-base md:text-lg lg:text-xl"
```

---

## Business Logic Rules

### Inventory Rules
1. **Never allow overselling** - Always check stock before confirming order
2. **Track all movements** - Use stock_movements table for audit trail
3. **Low stock alerts** - Alert when stock <= low_stock_threshold (default: 5)
4. **Out of stock** - Auto-mark unavailable when stock = 0 (unless backorder allowed)

### Order Processing
```typescript
// Order creation flow:
// 1. Validate customer info
// 2. Generate invoice PDF
// 3. Check and deduct stock
// 4. Save order to database
// 5. Send confirmation email
// 6. Send WhatsApp notification
// 7. Return order ID and invoice

// ⚠️ If stock deduction fails, STOP and return error
```

### Payment Methods
```typescript
type PaymentMethod = "cod" | "stcpay" | "whatsapp";

// For STC Pay: Require transaction_reference
if (paymentMethod === "stcpay" && !transactionReference) {
  return error("Transaction reference required");
}
```

### Delivery Rules
```typescript
// Free delivery eligibility:
const WAREHOUSE_LAT = 24.773125;
const WAREHOUSE_LNG = 46.725625;
const FREE_DELIVERY_RADIUS_KM = 20;
const MIN_PACKS_FOR_FREE_DELIVERY_NEAR = 3;  // Within 20km
const MIN_PACKS_FOR_FREE_DELIVERY_CITY = 5;  // Riyadh/Jeddah
```

---

## Security Best Practices

### Environment Variables
```typescript
// ✅ CORRECT: Use environment variables
const apiKey = process.env.RESEND_API_KEY;

// ❌ INCORRECT: Hardcoded secrets
const apiKey = "re_abc123...";
```

### Admin Authentication
```typescript
// Check admin authentication
import { isAdminAuthenticated } from "@/lib/adminAuth";

useEffect(() => {
  if (!isAdminAuthenticated()) {
    router.push("/admin"); // Redirect to login
  }
}, []);
```

### Input Validation
```typescript
// Always validate user input
if (!customerName || !customerPhone || !deliveryAddress) {
  return { error: "Missing required fields" };
}

// Sanitize for SQL (Supabase handles this, but be aware)
```

---

## Common Patterns

### Context Usage
```typescript
// Cart Context
const { items, addItem, removeItem, updateQuantity, clearCart, subtotal } = useCart();

// Language Context
const { language, setLanguage, t } = useLanguage();

// Analytics Context
const { trackEvent } = useAnalytics();

// Track events
trackEvent("purchase", {
  order_id: orderId,
  total_value: total,
  payment_method: paymentMethod,
});
```

### Loading States
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}
```

### Form Handling
```typescript
const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: "",
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    // API call
    const response = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error);
    }
    
    // Success handling
  } catch (err) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Testing Guidelines

### Manual Testing Checklist
When implementing new features, test:
- [ ] Works in Arabic and English
- [ ] Works in light and dark mode
- [ ] Works on mobile and desktop
- [ ] Handles empty states
- [ ] Handles error states
- [ ] Validates input properly
- [ ] Updates database correctly
- [ ] Sends notifications (if applicable)

### Stock System Testing
```sql
-- Check current stock
SELECT name, stock_quantity, low_stock_threshold 
FROM products WHERE sku = 'LULA-TEA-001';

-- View stock history
SELECT * FROM stock_movements 
WHERE product_id = '[product-uuid]'
ORDER BY created_at DESC;

-- Test stock deduction
SELECT deduct_product_stock(
  '[product-uuid]'::uuid,
  2,  -- quantity
  'TEST-ORDER-123'
);
```

---

## Performance Optimization

### Images
```typescript
// ✅ Use Next.js Image component
import Image from "next/image";

<Image
  src="/images/product.jpg"
  alt="Product"
  fill
  className="object-cover"
  priority // For above-the-fold images
/>

// ❌ Don't use regular img tag
<img src="/images/product.jpg" />
```

### API Calls
```typescript
// ✅ Use React Query or SWR for caching (future improvement)
// ✅ Debounce search inputs
// ✅ Pagination for large datasets
// ✅ Lazy load components
```

---

## Error Handling

### User-Friendly Errors
```typescript
// ✅ CORRECT: Helpful error messages
if (error.code === "insufficient_stock") {
  return language === "ar" 
    ? `المخزون غير كافٍ. متوفر: ${available}`
    : `Insufficient stock. Available: ${available}`;
}

// ❌ INCORRECT: Technical errors to users
return "Error: 42P01 relation does not exist";
```

### Console Logging
```typescript
// For development
console.log("Order created:", orderId);

// For errors (always)
console.error("Failed to create order:", error);

// For warnings
console.warn("Low stock alert:", productName);
```

---

## Deployment Notes

### Before Pushing
```bash
# 1. Check for TypeScript errors
npm run build

# 2. Check for lint errors
npm run lint

# 3. Test locally
npm run dev

# 4. Commit with descriptive message
git add .
git commit -m "Feature: Add X functionality"
git push
```

### Environment Variables in Vercel
After updating `.env.local`, remember to update Vercel:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add/update variable
3. Redeploy

---

## Common Tasks

### Add New Product
```sql
INSERT INTO products (
  name, name_ar, description, description_ar,
  price, stock_quantity, low_stock_threshold,
  category, sku, track_inventory
) VALUES (
  'New Tea', 'شاي جديد',
  'Description', 'الوصف',
  50.00, 100, 20,
  'Tea', 'TEA-NEW-001', true
);
```

### Update Admin Password
```env
# .env.local
ADMIN_PASSWORD=new_secure_password

# Then update in Vercel environment variables
```

### View Recent Orders
```sql
SELECT 
  order_id,
  customer_name,
  total,
  status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

---

## Important Reminders

### 🚨 NEVER commit:
- `.env.local` file
- API keys or passwords
- Personal information
- Database credentials

### ✅ ALWAYS:
- Support Arabic and English
- Include dark mode variants
- Check stock before orders
- Validate user input
- Handle errors gracefully
- Test on mobile
- Add TypeScript types
- Use semantic HTML
- Add alt text to images
- Follow accessibility guidelines

### 🔄 Keep Updated:
- Dependencies (npm update)
- Database migrations
- Documentation
- This instruction file

---

**Last Updated:** December 4, 2025  
**Version:** 1.0.0  
**For:** GitHub Copilot AI Assistant
