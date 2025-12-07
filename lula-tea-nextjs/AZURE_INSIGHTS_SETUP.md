# Azure Application Insights Setup (FREE)

## Step 1: Create Application Insights Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Application Insights"**
4. Click **Create**

### Configuration:
- **Subscription**: Your Azure subscription
- **Resource Group**: Create new or use existing
- **Name**: `lula-tea-insights`
- **Region**: Choose closest to Saudi Arabia (e.g., "UAE North" or "West Europe")
- **Workspace**: Create new Log Analytics workspace

## Step 2: Get Connection String

1. After resource is created, go to the resource
2. Click **"Overview"** in left sidebar
3. Copy the **"Connection String"** (looks like: `InstrumentationKey=xxx;IngestionEndpoint=https://...`)

## Step 3: Add to Environment Variables

### Local (.env.local):
```env
NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING=your_connection_string_here
```

### Vercel:
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add variable:
   - **Name**: `NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING`
   - **Value**: Your connection string
   - **Environments**: Production, Preview, Development

## Step 4: Verify It's Working

1. Deploy your site or run locally
2. Visit your site and interact (add to cart, chat, etc.)
3. Go to Azure Portal → Your Application Insights resource
4. Click **"Live Metrics"** to see real-time data
5. Click **"Transaction search"** to see individual events

## What's Being Tracked Automatically:

- ✅ Page views and load times
- ✅ API calls and response times
- ✅ JavaScript errors
- ✅ User sessions

## What's Being Tracked with Custom Events:

- ✅ Add to Cart (product, quantity, price)
- ✅ Checkout Started (total, item count)
- ✅ Chat Messages (message length, language)
- ✅ Order Completed (order ID, amount, payment method)
- ✅ Review Submitted (ratings)

## View Your Data

### Live Metrics (Real-time):
Portal → Application Insights → **Live Metrics**

### Custom Events:
Portal → Application Insights → **Logs** → Run query:
```kql
customEvents
| where timestamp > ago(24h)
| summarize count() by name
| order by count_ desc
```

### User Analytics:
Portal → Application Insights → **Users** → See:
- Active users
- New vs returning
- Session duration
- Top pages

## Pricing

**FREE TIER**: 5 GB data ingestion per month
- Your site will use ~100-500 MB/month
- No credit card required for free tier
- No charges unless you exceed 5 GB

## Dashboard Example Queries

### Most used chat topics:
```kql
customEvents
| where name == "ChatMessageSent"
| extend messageLength = toint(customDimensions.messageLength)
| summarize count() by language = tostring(customDimensions.language)
```

### Checkout conversion rate:
```kql
let checkouts = customEvents | where name == "CheckoutStarted" | count;
let orders = customEvents | where name == "OrderCompleted" | count;
print ConversionRate = (orders * 100.0) / checkouts
```

### Popular products:
```kql
customEvents
| where name == "AddToCart"
| extend productId = tostring(customDimensions.productId)
| summarize TotalAdded = sum(toint(customDimensions.quantity)) by productId
```
