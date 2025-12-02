# Lula Tea - Premium Tea E-commerce Website

A complete e-commerce platform for selling premium tea blends.

## Features

- 🏠 Beautiful homepage with hero section
- 🛍️ Product detail page with reviews
- 🛒 Shopping cart functionality
- 👤 User registration and authentication
- 💳 Secure payment processing with Stripe
- 📦 Order management and tracking
- 🔍 Search functionality
- 📱 Fully responsive design
- 🔒 SSL/HTTPS support
- 🎯 SEO optimized

## Product

**Premium Tea Blend** - 250g bag for 1,500 SAR

## Installation

1. Install dependencies:
```bash
npm install
```

2. **Add your logo** (optional but recommended):
   - Save your logo image as: `public/images/lula-tea-logo.png`
   - Save favicon as: `public/images/favicon.png` (32x32 or 64x64px)
   - See `LOGO-INTEGRATION-COMPLETE.md` for details

3. Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

4. Update the `.env` file with your:
   - Session secret key
   - Stripe API keys (from https://stripe.com/)

5. Run the development server:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## Production Deployment

For production, ensure:
- Set `NODE_ENV=production` in `.env`
- Configure SSL certificates
- Set `SSL_ENABLED=true`
- Use a strong `SESSION_SECRET`
- Use production Stripe keys

## Technologies Used

- **Backend**: Node.js, Express
- **Template Engine**: EJS
- **Payment**: Stripe
- **Session Management**: express-session
- **Security**: bcrypt, SSL/HTTPS
- **Styling**: CSS3 with responsive design

## License

ISC
