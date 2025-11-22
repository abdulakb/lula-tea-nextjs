# Lula Tea - E-Commerce Website

A complete, modern, colorful, mobile-first e-commerce website for Lula Tea, a small family brand selling premium loose leaf tea blends.

## 🌟 Features

- **Bilingual Support**: Full English and Arabic with proper RTL support
- **E-Commerce Functionality**: Product display, shopping cart with LocalStorage persistence
- **WhatsApp Checkout**: Direct checkout via WhatsApp with QR code
- **Authentication**: Supabase passwordless auth with magic links
- **Responsive Design**: Mobile-first, fully responsive across all devices
- **Modern UI/UX**: Smooth animations, hover effects, and micro-interactions
- **PWA Ready**: Installable as a Progressive Web App
- **AI Assistant Ready**: Placeholder chat widget for future AI bot/copilot integration
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **SEO Optimized**: Meta tags and proper structure

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm package manager
- Supabase account (optional, for auth and orders)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Update with your values:
     ```env
     NEXT_PUBLIC_SITE_NAME="Lula Tea"
     NEXT_PUBLIC_WHATSAPP_NUMBER="966539666654"
     NEXT_PUBLIC_WHATSAPP_URL="https://wa.me/966539666654"
     NEXT_PUBLIC_CURRENCY="SAR"
     NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
     ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## 🗄 Database Setup (Supabase)

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🌐 Deployment to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.local`
4. Deploy!

## 🤖 AI Bot/Copilot Integration (Future)

The project includes placeholders for AI assistant integration:

- **API Endpoint**: `/app/api/assistant/route.ts`
- **Chat Widget**: `app/components/ChatWidget.tsx`

To integrate a real AI assistant:
1. Choose an AI service (OpenAI, Claude, etc.)
2. Update the API endpoint with actual AI calls
3. Implement conversation history
4. Add streaming responses (optional)

## 📱 Features Checklist

✅ Bilingual (EN/AR) with RTL support  
✅ Product display with quantity selector  
✅ Shopping cart with LocalStorage  
✅ WhatsApp checkout with QR code  
✅ Supabase authentication (magic link)  
✅ Responsive mobile-first design  
✅ Language toggle (UK/SA flags)  
✅ Cart badge with item count  
✅ PWA manifest  
✅ AI assistant placeholder  

## 📄 Product

- **Item**: 250g Premium Loose Leaf Tea Blend
- **Price**: 30 SAR
- **Description**: Carefully crafted with the finest ingredients, made with love

## 📞 Contact

For support: WhatsApp +966 53 966 6654

---

**Made with ❤️ for Lula Tea**
