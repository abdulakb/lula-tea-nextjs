# Customer Authentication & Account Management

## Overview
A complete phone-based customer authentication system with OTP verification via WhatsApp. Customers can:
- Sign up/login using phone number
- Verify via 6-digit OTP sent to WhatsApp
- View order history
- Track order status
- Cancel pending orders
- Manage profile information

## Features Implemented

### 1. **Phone-Based Authentication**
- No password required
- OTP verification via WhatsApp
- 10-minute OTP expiry
- Maximum 3 verification attempts
- Automatic customer account creation

### 2. **Customer Dashboard**
- View all past orders
- Real-time order status tracking
- Order details with items and pricing
- Cancel orders (if pending/processing)
- Profile management
- Bilingual support (English/Arabic)

### 3. **Order Management**
- Orders automatically linked to verified customers
- View order history with filtering
- Track delivery status
- Cancel orders before shipping
- Update delivery information

## Database Setup

### Step 1: Run the Migration

You need to execute the SQL migration to create the required database tables. Here are two methods:

#### Method A: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `ktvbmxliscwhmlxlfyly`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire content from `supabase/migrations/006_create_customer_auth_tables.sql`
6. Click **Run** or press `Ctrl+Enter`
7. Verify the tables were created:
   ```sql
   SELECT * FROM customers LIMIT 1;
   SELECT * FROM otp_verifications LIMIT 1;
   ```

#### Method B: Using psql or Database Client

If you have database credentials, connect directly:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.ktvbmxliscwhmlxlfyly.supabase.co:5432/postgres" -f supabase/migrations/006_create_customer_auth_tables.sql
```

### Database Schema Created

#### `customers` table
```sql
- id (SERIAL PRIMARY KEY)
- phone (TEXT UNIQUE NOT NULL) - Format: +966XXXXXXXXX
- name (TEXT)
- email (TEXT)
- address (TEXT)
- city (TEXT)
- verified (BOOLEAN DEFAULT false)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `otp_verifications` table
```sql
- id (SERIAL PRIMARY KEY)
- phone (TEXT NOT NULL)
- otp_code (TEXT NOT NULL) - 6-digit code
- expires_at (TIMESTAMP NOT NULL) - 10 minutes from creation
- verified (BOOLEAN DEFAULT false)
- attempts (INT DEFAULT 0) - Max 3 attempts
- created_at (TIMESTAMP)
```

#### `orders` table (modified)
```sql
- customer_id (INT) - Foreign key to customers.id
- (All existing columns remain unchanged)
```

## API Endpoints

### 1. OTP Authentication
**POST** `/api/auth/otp`

#### Request OTP
```json
{
  "action": "request-otp",
  "phone": "+966501234567" // or "0501234567" (auto-sanitized)
}
```

**Response (Production):**
```json
{
  "success": true,
  "message": "OTP sent to your WhatsApp",
  "expiresIn": 600
}
```

**Response (Development - NODE_ENV !== 'production'):**
```json
{
  "success": true,
  "message": "OTP sent to your WhatsApp",
  "expiresIn": 600,
  "devOTP": "123456"  // Only in development
}
```

#### Verify OTP
```json
{
  "action": "verify-otp",
  "phone": "+966501234567",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification successful",
  "customer": {
    "id": 1,
    "phone": "+966501234567",
    "name": "Ahmed Abdullah",
    "email": "ahmed@example.com",
    "verified": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Customer Profile
**GET** `/api/customer/profile?phone=+966501234567`

**Response:**
```json
{
  "customer": {
    "id": 1,
    "phone": "+966501234567",
    "name": "Ahmed Abdullah",
    "email": "ahmed@example.com",
    "address": "123 King Fahd Road",
    "city": "Riyadh",
    "verified": true
  }
}
```

**PATCH** `/api/customer/profile`

```json
{
  "phone": "+966501234567",
  "name": "Ahmed Abdullah",
  "email": "ahmed@example.com",
  "address": "123 King Fahd Road",
  "city": "Riyadh"
}
```

### 3. Customer Orders
**GET** `/api/customer/orders?customer_id=1`

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "order_id": "LT1234567890",
      "total_amount": 150,
      "status": "delivered",
      "created_at": "2024-01-15T10:30:00Z",
      "items": [...],
      // ... other order details
    }
  ]
}
```

**GET** `/api/customer/orders?customer_id=1&order_id=LT1234567890`

Returns single order details.

**PATCH** `/api/customer/orders` (Cancel Order)

```json
{
  "orderId": "LT1234567890",
  "customerId": 1,
  "action": "cancel"
}
```

## Component Usage

### AuthModal Component

```tsx
import AuthModal from '@/app/components/AuthModal';

function MyComponent() {
  const [showAuth, setShowAuth] = useState(false);
  const { language } = useLanguage();

  const handleAuthSuccess = (customer) => {
    console.log('Customer logged in:', customer);
    // Save to localStorage (automatically done in modal)
    // Redirect or update UI
  };

  return (
    <AuthModal
      isOpen={showAuth}
      onClose={() => setShowAuth(false)}
      onSuccess={handleAuthSuccess}
      language={language}
    />
  );
}
```

### Accessing Customer Session

```tsx
// Get logged-in customer
const customerData = localStorage.getItem('lula_customer');
if (customerData) {
  const customer = JSON.parse(customerData);
  console.log(customer.name, customer.phone);
}

// Logout
localStorage.removeItem('lula_customer');
```

## User Flow

### 1. Customer Login/Signup
```
1. User clicks "Account" in header
2. Redirected to /customer/dashboard
3. If not logged in, AuthModal opens
4. User enters phone number (auto-formatted)
5. Clicks "Send Code"
6. OTP sent via WhatsApp
7. User enters 6-digit code
8. If new customer: Fill name (optional email)
9. If existing customer: Redirect to dashboard
10. Session saved in localStorage
```

### 2. Viewing Orders
```
1. Customer dashboard loads
2. Fetches orders using customer_id
3. Displays order cards with status
4. Click order to view full details
5. Can cancel if status is pending/processing
```

### 3. Order Placement (Checkout)
```
1. Customer fills checkout form
2. Phone number matched against customers table
3. If verified customer found, order linked via customer_id
4. Order saved with customer_id reference
5. Customer can view order in dashboard
```

## Security Features

- **OTP Expiry**: Codes expire after 10 minutes
- **Attempt Limiting**: Maximum 3 verification attempts per OTP
- **Phone Sanitization**: Automatic format validation for Saudi numbers
- **Verified Status**: Only verified customers can access orders
- **Session Storage**: Local storage for client-side session management

## Phone Number Formats

All these formats are automatically sanitized to `+966XXXXXXXXX`:
- `0501234567` → `+966501234567`
- `966501234567` → `+966501234567`
- `+966501234567` → `+966501234567`
- `501234567` (9 digits starting with 5) → `+966501234567`

## Testing

### Development Mode Testing

In development (NODE_ENV !== 'production'), the OTP is returned in the API response for easy testing:

```json
{
  "success": true,
  "devOTP": "123456"
}
```

### Test Flow

1. **Start dev server**: `npm run dev`
2. **Navigate to**: http://localhost:3000/account
3. **Enter phone**: `0501234567`
4. **Click**: "Send Code"
5. **Check console** or response for OTP
6. **Enter OTP** and verify
7. **Complete profile** (if new customer)
8. **View dashboard** with order history

### Testing WhatsApp OTP Delivery

To test actual WhatsApp delivery:

1. Use your real phone number
2. Ensure WhatsApp is installed and active
3. Check WhatsApp for message from your business number
4. Message format:
```
[English]
Your Lula Tea verification code is: 123456
This code expires in 10 minutes.

[Arabic]
رمز التحقق الخاص بك في شاي لولا هو: 123456
ينتهي هذا الرمز خلال 10 دقائق.
```

## Deployment Checklist

- [ ] Run database migration in Supabase Dashboard
- [ ] Verify tables created: `customers`, `otp_verifications`
- [ ] Verify `orders` table has `customer_id` column
- [ ] Test OTP generation and WhatsApp delivery
- [ ] Test phone verification flow
- [ ] Test order linking to customer accounts
- [ ] Test customer dashboard access
- [ ] Test order cancellation
- [ ] Ensure NODE_ENV=production for deployment (hides dev OTP)
- [ ] Build and deploy: `npm run build`

## Troubleshooting

### OTP Not Received
- Check WhatsApp number in `.env.local`: `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Verify phone format: Must be `966XXXXXXXXX` (Saudi)
- Check WhatsApp URL generation in `/api/auth/otp`
- Test manually: https://wa.me/966501234567?text=Test

### Customer Not Found
- Verify phone format matches database
- Check `verified = true` in customers table
- Confirm OTP was successfully verified

### Orders Not Showing
- Check `customer_id` is set in orders table
- Verify customer is logged in (localStorage has `lula_customer`)
- Check API response in browser console
- Query database: `SELECT * FROM orders WHERE customer_id = 1;`

### Database Migration Failed
- Check Supabase dashboard for errors
- Ensure you have proper permissions
- Try running statements one by one
- Check if tables already exist

## Future Enhancements

- [ ] Email notifications for order updates
- [ ] SMS OTP fallback option
- [ ] Customer address book (multiple addresses)
- [ ] Order modification (change items, quantity)
- [ ] Reorder functionality
- [ ] Customer loyalty points system
- [ ] Profile picture upload
- [ ] Order rating and feedback

## Support

For issues or questions:
- Check Supabase logs in dashboard
- Review browser console for errors
- Test API endpoints using Postman/cURL
- Contact: orders@lulatee.com
