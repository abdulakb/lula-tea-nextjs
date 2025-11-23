# Analytics Setup Guide

## Overview
Your Lula Tea Next.js site now has comprehensive visitor analytics tracking that monitors user behavior and conversion rates.

## Features Implemented

### 1. Visitor Tracking
- **UUID-based identification**: Each visitor gets a unique ID stored in localStorage
- **Persistent tracking**: Visitor ID persists across sessions
- **Automatic page views**: Every page visit is tracked automatically

### 2. Event Tracking
The system tracks these key events:
- **page_view**: Automatic on every page load
- **add_to_cart**: When user clicks "Add to Cart" button
- **checkout_start**: When user reaches checkout page
- **purchase**: When order is completed

### 3. Analytics Dashboard
Access at: `https://lula-tea-nextjs.vercel.app/admin/analytics`

**Metrics Displayed:**
- Unique Visitors
- Total Page Views
- Conversion Rate (visitor → purchase)
- Cart Conversion Rate (cart → purchase)

**Visualizations:**
- Time series line chart (views, carts, checkouts, purchases)
- Conversion funnel bar chart
- Top pages breakdown
- Time range selector (7/14/30/90 days)

## Database Schema

### analytics_events Table
Located in Supabase with this structure:
```sql
- id: UUID (primary key)
- visitor_id: VARCHAR(255) - Unique visitor identifier
- event_type: VARCHAR(100) - Type of event (page_view, add_to_cart, etc.)
- event_data: JSONB - Event-specific data (product_id, price, cart value, etc.)
- page_url: TEXT - Where the event occurred
- referrer: TEXT - Previous page URL
- user_agent: TEXT - Browser information
- screen_width: INTEGER - User's screen width
- screen_height: INTEGER - User's screen height
- created_at: TIMESTAMP - When event occurred
```

**Indexes for Performance:**
- visitor_id
- event_type
- created_at
- page_url

## Setup Instructions

### 1. Database Migration
Run this SQL in Supabase SQL Editor:

```sql
-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON public.analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_url ON public.analytics_events(page_url);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow service role to insert analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role to read analytics" ON public.analytics_events
  FOR SELECT USING (true);
```

### 2. Environment Variables
Already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Technical Architecture

### Files Created/Modified

**New Files:**
1. `context/AnalyticsContext.tsx` - Analytics provider with tracking logic
2. `app/api/analytics/track/route.ts` - API endpoint for saving/retrieving events
3. `app/admin/analytics/page.tsx` - Analytics dashboard with charts
4. `supabase/migrations/002_create_analytics_table.sql` - Database schema

**Modified Files:**
1. `app/layout.tsx` - Added AnalyticsProvider wrapper
2. `app/components/ProductCard.tsx` - Added add_to_cart tracking
3. `app/checkout/page.tsx` - Added checkout_start and purchase tracking
4. `app/admin/page.tsx` - Added Analytics link
5. `package.json` - Added recharts and uuid dependencies

### How It Works

1. **Visitor ID Generation**: 
   - On first visit, UUID is generated and stored in localStorage
   - Same ID used for all subsequent events

2. **Event Collection**:
   - AnalyticsContext wraps entire app
   - `trackEvent()` function available via useAnalytics() hook
   - Events stored in localStorage first (offline support)
   - Batch sent to API endpoint

3. **Data Storage**:
   - POST `/api/analytics/track` saves events to Supabase
   - Includes visitor info, event data, page context

4. **Metrics Calculation**:
   - GET `/api/analytics/track?days=30` retrieves events
   - Server-side aggregation for performance
   - Calculates unique visitors, conversion rates

5. **Visualization**:
   - Recharts library for beautiful charts
   - Real-time data updates
   - Responsive design

## Usage Examples

### Track Custom Event (if needed)
```typescript
import { useAnalytics } from '@/context/AnalyticsContext';

function MyComponent() {
  const { trackEvent } = useAnalytics();
  
  const handleAction = () => {
    trackEvent('custom_event', {
      custom_property: 'value'
    });
  };
  
  return <button onClick={handleAction}>Action</button>;
}
```

### View Analytics
1. Go to `https://lula-tea-nextjs.vercel.app/admin`
2. Log in with password: `lulatea2024`
3. Click "Analytics" card
4. View metrics and charts

## Key Metrics Explained

### Conversion Rate
Formula: `(purchases / unique_visitors) * 100`
- Shows what % of visitors make a purchase
- Higher is better (typical e-commerce: 2-5%)

### Cart Conversion Rate
Formula: `(purchases / add_to_cart_events) * 100`
- Shows what % of cart additions lead to purchase
- Measures checkout effectiveness

### Page Views per Visitor
Formula: `total_page_views / unique_visitors`
- Average pages viewed per visitor
- Higher engagement = more pages

## Privacy & Performance

- **Privacy**: No personal data collected (only anonymous visitor ID)
- **Performance**: Non-blocking async tracking
- **Offline**: Events cached in localStorage if API fails
- **Storage**: Automatic cleanup of old localStorage data

## Troubleshooting

### Events Not Appearing
1. Check Supabase table exists: `analytics_events`
2. Verify environment variables are set
3. Check browser console for errors
4. Ensure RLS policies are created

### Dashboard Shows Zero
1. Visit the site and perform actions (view pages, add to cart)
2. Wait 10-30 seconds for events to process
3. Refresh analytics dashboard
4. Check time range filter (default is 7 days)

### Chart Not Loading
1. Clear browser cache
2. Check for JavaScript errors in console
3. Verify recharts is installed: `npm list recharts`

## Cost & Limitations

**Free Tier Limits:**
- Supabase: 500MB database, unlimited API requests
- Vercel: Unlimited bandwidth for hobby projects
- No additional costs for analytics

**Data Retention:**
- Keep as much historical data as you want
- Supabase free tier: 500MB total storage
- Each event ~500 bytes → ~1 million events fit in free tier

## Future Enhancements

Potential additions:
- Geographic tracking (country/city)
- Device type breakdown (mobile/desktop)
- Traffic source analysis (referrers)
- A/B testing support
- Custom event exports (CSV/Excel)
- Email reports (daily/weekly)

## Support

For issues or questions:
1. Check Supabase logs: Project → Logs → API
2. Check Vercel deployment logs
3. Review browser console for client-side errors
4. Verify all migrations ran successfully

---

**Last Updated**: November 23, 2025
**Version**: 1.0.0
**Commit**: 4bc0f37
