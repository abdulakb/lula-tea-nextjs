# Lula Tea - Setup and Installation Guide

## Prerequisites

Before you can run this project, you need to have the following installed on your system:

### 1. Install Node.js and npm

Download and install Node.js from: https://nodejs.org/
- Recommended: Download the LTS (Long Term Support) version
- This will also install npm (Node Package Manager) automatically
- After installation, restart your terminal/command prompt

To verify installation, run:
```bash
node --version
npm --version
```

## Installation Steps

### Step 1: Navigate to Project Directory
```bash
cd "c:\Users\akbah\Dev\Sandbox-python\Lula Tea"
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all the required packages:
- express - Web framework
- ejs - Template engine
- express-session - Session management
- bcrypt - Password hashing
- stripe - Payment processing
- dotenv - Environment variable management
- body-parser - Request body parsing
- cookie-parser - Cookie handling
- uuid - Unique ID generation
- nodemon (dev) - Auto-restart during development

### Step 3: Configure Environment Variables

The `.env` file has been created with default values. Update it with your settings:

1. Generate a secure SESSION_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and replace the SESSION_SECRET value in `.env`

2. (Optional) Set up Stripe:
   - Sign up at https://stripe.com/
   - Get your API keys from the Dashboard
   - Update STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY in `.env`
   - Note: The demo works without real Stripe keys

### Step 4: Add Product Images (Optional)

Place your product images in the `public/images/` folder:
- `tea-product-1.jpg` - Main product image
- `tea-product-2.jpg` - Additional view
- `tea-product-3.jpg` - Lifestyle shot
- `favicon.png` - Website icon

If images are not provided, placeholder images will be used automatically.

### Step 5: Start the Development Server
```bash
npm run dev
```

Or for production:
```bash
npm start
```

### Step 6: Access the Website

Open your web browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
Lula Tea/
├── data/
│   └── database.js          # In-memory database
├── public/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   └── main.js          # Client-side JavaScript
│   └── images/              # Product images
├── routes/
│   ├── home.js              # Home and static pages
│   ├── product.js           # Product page
│   ├── cart.js              # Shopping cart
│   ├── auth.js              # Authentication
│   ├── user.js              # User profile
│   ├── checkout.js          # Checkout process
│   └── order.js             # Order management
├── views/
│   ├── auth/                # Login/Register pages
│   ├── order/               # Order pages
│   ├── user/                # User pages
│   ├── home.ejs             # Homepage
│   ├── product.ejs          # Product page
│   ├── cart.ejs             # Cart page
│   ├── checkout.ejs         # Checkout page
│   ├── search.ejs           # Search results
│   ├── about.ejs            # About page
│   ├── contact.ejs          # Contact page
│   ├── 404.ejs              # 404 error page
│   └── error.ejs            # Error page
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
├── README.md                # Project documentation
└── server.js                # Main server file
```

## Features

✅ **Homepage** - Hero section with featured product
✅ **Product Page** - Detailed product view with reviews and ratings
✅ **Shopping Cart** - Add/remove items, update quantities
✅ **User Authentication** - Registration and login with bcrypt
✅ **User Profile** - Manage personal info and addresses
✅ **Order Management** - Place orders, view history, track orders
✅ **Payment Integration** - Stripe payment processing (demo mode included)
✅ **Search Functionality** - Find products easily
✅ **Responsive Design** - Works on mobile, tablet, and desktop
✅ **SEO Optimized** - Meta tags and descriptions
✅ **Security** - Session management, password hashing, HTTPS ready

## Default Product

The website features one premium product:
- **Name**: Premium Tea Blend
- **Price**: 1,500 SAR
- **Weight**: 250g bag
- **Description**: A signature blend of premium tea leaves

## Testing the Website

### 1. Create an Account
- Click "Login" in the header
- Click "Register here"
- Fill in your details
- Submit the form

### 2. Browse and Add to Cart
- View the product on the homepage or product page
- Select quantity
- Click "Add to Cart"

### 3. Checkout Process
- Go to cart
- Click "Proceed to Checkout"
- Select or add a shipping address
- Choose payment method (demo mode works without real payment)
- Place order

### 4. Track Your Order
- View order confirmation
- Check order history in your profile
- Track order status with tracking number

## Production Deployment

### Before deploying to production:

1. **Update Environment Variables**:
   ```
   NODE_ENV=production
   SESSION_SECRET=your-strong-secret-key
   STRIPE_PUBLIC_KEY=pk_live_your_real_key
   STRIPE_SECRET_KEY=sk_live_your_real_key
   ```

2. **Set up SSL/HTTPS**:
   - Obtain SSL certificates (Let's Encrypt, CloudFlare, etc.)
   - Place certificates in the `ssl/` folder
   - Update `.env`:
     ```
     SSL_ENABLED=true
     SSL_KEY_PATH=./ssl/private.key
     SSL_CERT_PATH=./ssl/certificate.crt
     ```

3. **Use a Real Database**:
   - Replace the in-memory database in `data/database.js`
   - Consider MongoDB, PostgreSQL, or MySQL
   - Update all database operations accordingly

4. **Set up a Process Manager**:
   - Use PM2 to keep the server running:
     ```bash
     npm install -g pm2
     pm2 start server.js --name lula-tea
     pm2 startup
     pm2 save
     ```

5. **Deploy to a Hosting Service**:
   - Options: Heroku, DigitalOcean, AWS, Azure, Vercel
   - Configure environment variables on the platform
   - Set up domain and DNS

## Troubleshooting

### npm install fails
- Make sure Node.js is properly installed
- Try deleting `node_modules` folder and `package-lock.json`
- Run `npm install` again

### Port 3000 already in use
- Change PORT in `.env` file to a different number (e.g., 3001)
- Or stop the process using port 3000

### Images not displaying
- Check that images are in `public/images/` folder
- Verify file names match those in `data/database.js`
- Placeholder images will show if real images are missing

### Session not persisting
- Make sure SESSION_SECRET is set in `.env`
- Clear browser cookies and try again

## Support

For issues or questions:
- Email: info@lulatea.com
- Check the code comments for implementation details
- Review the README files in each folder

## License

ISC

---

**Enjoy your Lula Tea E-commerce Website! ☕**
