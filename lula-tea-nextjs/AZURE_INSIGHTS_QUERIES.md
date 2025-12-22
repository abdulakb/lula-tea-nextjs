# Azure Application Insights Queries

## 📊 How to Access Your Data

1. Go to **Azure Portal** (https://portal.azure.com)
2. Search for your **Application Insights** resource
3. Click **Logs** in the left sidebar
4. Copy-paste these queries

---

## 👥 Daily Visitors

### Number of Unique Visitors (Last 7 Days)
```kusto
pageViews
| where timestamp > ago(7d)
| summarize UniqueVisitors = dcount(user_Id) by bin(timestamp, 1d)
| order by timestamp desc
| render timechart
```

### Total Page Views Today
```kusto
pageViews
| where timestamp > ago(1d)
| summarize TotalPageViews = count(), UniqueUsers = dcount(user_Id)
```

### Most Visited Pages
```kusto
pageViews
| where timestamp > ago(7d)
| summarize PageViews = count() by name
| order by PageViews desc
| take 10
```

---

## 🛒 Shopping Behavior

### Add to Cart Events
```kusto
customEvents
| where name == "AddToCart"
| where timestamp > ago(7d)
| extend ProductId = tostring(customDimensions.productId)
| extend Quantity = toint(customDimensions.quantity)
| extend TotalPrice = todouble(customDimensions.totalPrice)
| summarize TimesAdded = count(), TotalQuantity = sum(Quantity) by ProductId
| order by TimesAdded desc
```

### Checkout Started vs Completed
```kusto
customEvents
| where name in ("CheckoutStarted", "OrderCompleted")
| where timestamp > ago(7d)
| summarize 
    CheckoutStarted = countif(name == "CheckoutStarted"),
    OrdersCompleted = countif(name == "OrderCompleted")
| extend ConversionRate = round((OrdersCompleted * 100.0) / CheckoutStarted, 2)
| extend AbandonmentRate = round(100 - ConversionRate, 2)
```

---

## 🚫 Checkout Abandonment Analysis

### Why Users Abandoned Checkout
```kusto
customEvents
| where name == "CheckoutAbandoned"
| where timestamp > ago(7d)
| extend Reason = tostring(customDimensions.reason)
| extend Stage = tostring(customDimensions.stage)
| extend Amount = todouble(customDimensions.totalAmount)
| summarize 
    Abandonments = count(),
    AvgCartValue = round(avg(Amount), 2)
    by Reason, Stage
| order by Abandonments desc
```

### Abandonment by Hour of Day
```kusto
customEvents
| where name == "CheckoutAbandoned"
| where timestamp > ago(7d)
| extend Hour = hourofday(timestamp)
| summarize Abandonments = count() by Hour
| order by Hour asc
| render columnchart
```

---

## 💳 Payment Methods

### Payment Method Distribution
```kusto
customEvents
| where name == "OrderCompleted"
| where timestamp > ago(30d)
| extend PaymentMethod = tostring(customDimensions.paymentMethod)
| summarize Orders = count() by PaymentMethod
| render piechart
```

### Failed Payment Attempts (if you add tracking)
```kusto
customEvents
| where name == "PaymentFailed"
| where timestamp > ago(7d)
| extend Reason = tostring(customDimensions.reason)
| extend Method = tostring(customDimensions.paymentMethod)
| summarize Failures = count() by Reason, Method
| order by Failures desc
```

---

## 🕒 User Session Analysis

### Average Session Duration
```kusto
pageViews
| where timestamp > ago(7d)
| summarize SessionDuration = sum(duration) by session_Id
| summarize AvgSessionMinutes = round(avg(SessionDuration) / 60000, 2)
```

### Bounce Rate (Single Page Sessions)
```kusto
pageViews
| where timestamp > ago(7d)
| summarize PageCount = count() by session_Id
| summarize 
    TotalSessions = count(),
    BounceCount = countif(PageCount == 1)
| extend BounceRate = round((BounceCount * 100.0) / TotalSessions, 2)
```

---

## 📱 Device & Browser Stats

### Device Type Distribution
```kusto
pageViews
| where timestamp > ago(7d)
| extend DeviceType = tostring(client_Type)
| summarize Users = dcount(user_Id) by DeviceType
| render piechart
```

### Browser Distribution
```kusto
pageViews
| where timestamp > ago(7d)
| extend Browser = tostring(client_Browser)
| summarize Users = dcount(user_Id) by Browser
| order by Users desc
```

---

## 🌍 Geographic Data

### Visitors by Country
```kusto
pageViews
| where timestamp > ago(7d)
| extend Country = tostring(client_CountryOrRegion)
| summarize Visitors = dcount(user_Id), PageViews = count() by Country
| order by Visitors desc
```

### Visitors by City
```kusto
pageViews
| where timestamp > ago(7d)
| extend City = tostring(client_City)
| summarize Visitors = dcount(user_Id) by City
| order by Visitors desc
| take 10
```

---

## 🔍 Product Analytics

### Most Viewed Products
```kusto
customEvents
| where name == "ProductViewed"
| where timestamp > ago(7d)
| extend ProductName = tostring(customDimensions.productName)
| extend ProductId = tostring(customDimensions.productId)
| summarize Views = count() by ProductName, ProductId
| order by Views desc
| take 10
```

### Add-to-Cart Conversion Rate
```kusto
let productViews = customEvents
| where name == "ProductViewed"
| where timestamp > ago(7d)
| extend ProductId = tostring(customDimensions.productId)
| summarize Views = count() by ProductId;
let addToCarts = customEvents
| where name == "AddToCart"
| where timestamp > ago(7d)
| extend ProductId = tostring(customDimensions.productId)
| summarize Adds = count() by ProductId;
productViews
| join kind=leftouter addToCarts on ProductId
| extend ConversionRate = round((Adds * 100.0) / Views, 2)
| order by ConversionRate desc
```

---

## ⚠️ Errors & Performance

### Page Load Performance
```kusto
pageViews
| where timestamp > ago(7d)
| summarize AvgLoadTime = round(avg(duration), 2) by name
| order by AvgLoadTime desc
```

### JavaScript Errors
```kusto
exceptions
| where timestamp > ago(7d)
| summarize ErrorCount = count() by problemId, outerMessage
| order by ErrorCount desc
```

---

## 💰 Revenue Analytics

### Revenue by Day
```kusto
customEvents
| where name == "OrderCompleted"
| where timestamp > ago(30d)
| extend Amount = todouble(customDimensions.totalAmount)
| summarize Revenue = sum(Amount) by bin(timestamp, 1d)
| order by timestamp desc
| render timechart
```

### Average Order Value
```kusto
customEvents
| where name == "OrderCompleted"
| where timestamp > ago(30d)
| extend Amount = todouble(customDimensions.totalAmount)
| summarize 
    TotalOrders = count(),
    TotalRevenue = sum(Amount),
    AvgOrderValue = round(avg(Amount), 2)
```

---

## 🎯 Campaign Tracking (if you add UTM parameters)

### Traffic Sources
```kusto
pageViews
| where timestamp > ago(7d)
| extend Source = tostring(customDimensions.utm_source)
| where isnotempty(Source)
| summarize Visits = count() by Source
| order by Visits desc
```

---

## 📈 Real-Time Dashboard Query

### Live Stats (Last Hour)
```kusto
union pageViews, customEvents
| where timestamp > ago(1h)
| summarize 
    ActiveUsers = dcount(user_Id),
    PageViews = countif(itemType == "pageView"),
    AddToCartEvents = countif(name == "AddToCart"),
    CheckoutsStarted = countif(name == "CheckoutStarted"),
    OrdersCompleted = countif(name == "OrderCompleted")
```

---

## 🚀 Pro Tips

1. **Create Alerts**: In Azure Portal → Alerts → Create new alert based on these queries
2. **Pin to Dashboard**: Run a query → Click "Pin to dashboard" to monitor 24/7
3. **Export Data**: Query results can be exported to Excel for reports
4. **Set up Workbooks**: Azure Monitor Workbooks for custom dashboards

---

## 📝 Important Notes

- **user_Id**: Azure automatically generates this (anonymous tracking)
- **session_Id**: Unique per browser session
- **Timestamps**: All times are in UTC
- **customDimensions**: Contains your custom tracked data

## 🔒 Privacy Compliance

This tracking is **GDPR compliant** because:
- No personal information is collected without consent
- User IDs are anonymous
- No cookies without user consent
- Data is stored securely in Azure
