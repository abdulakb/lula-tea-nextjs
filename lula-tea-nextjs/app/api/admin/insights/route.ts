import { NextRequest, NextResponse } from "next/server";

// Simple analytics endpoint that aggregates data from your database
// For real Azure Insights data, you'd need to configure Azure credentials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    // This is a simplified version using your existing analytics data
    // For production, you would query Azure Application Insights API
    
    // Mock data structure - replace with actual Azure Insights queries
    const mockData = {
      visitors: {
        total: 1247,
        unique: 892,
        new: 234,
        returning: 658,
        byDay: generateDailyData(days, 50, 200),
      },
      pageViews: {
        total: 5432,
        avgPerSession: 4.3,
        topPages: [
          { page: "/", views: 1234, uniqueVisitors: 892 },
          { page: "/products", views: 876, uniqueVisitors: 654 },
          { page: "/checkout", views: 543, uniqueVisitors: 432 },
          { page: "/cart", views: 432, uniqueVisitors: 321 },
          { page: "/account", views: 234, uniqueVisitors: 198 },
        ],
        byDay: generateDailyData(days, 200, 800),
      },
      shopping: {
        addToCart: 234,
        checkoutStarted: 156,
        checkoutCompleted: 89,
        abandonmentRate: 42.9,
        conversionRate: 57.1,
        funnel: [
          { stage: "Product Views", count: 876, rate: 100 },
          { stage: "Add to Cart", count: 234, rate: 26.7 },
          { stage: "Checkout Started", count: 156, rate: 66.7 },
          { stage: "Order Completed", count: 89, rate: 57.1 },
        ],
      },
      abandonment: {
        total: 67,
        reasons: [
          { reason: "page_exit", count: 45, percentage: 67.2 },
          { reason: "payment_failed", count: 12, percentage: 17.9 },
          { reason: "no_payment_method", count: 10, percentage: 14.9 },
        ],
        byStage: [
          { stage: "cart", count: 20 },
          { stage: "checkout_info", count: 35 },
          { stage: "payment", count: 12 },
        ],
        byHour: generateHourlyData(),
      },
      devices: {
        desktop: 45.2,
        mobile: 48.3,
        tablet: 6.5,
      },
      browsers: [
        { name: "Chrome", percentage: 65.3 },
        { name: "Safari", percentage: 22.1 },
        { name: "Firefox", percentage: 8.4 },
        { name: "Edge", percentage: 4.2 },
      ],
      geography: {
        topCountries: [
          { country: "Saudi Arabia", visitors: 756, percentage: 84.8 },
          { country: "United Arab Emirates", visitors: 89, percentage: 10.0 },
          { country: "Kuwait", visitors: 32, percentage: 3.6 },
          { country: "Others", visitors: 15, percentage: 1.6 },
        ],
        topCities: [
          { city: "Riyadh", visitors: 432 },
          { city: "Jeddah", visitors: 234 },
          { city: "Dubai", visitors: 89 },
          { city: "Dammam", visitors: 67 },
          { city: "Kuwait City", visitors: 32 },
        ],
      },
      performance: {
        avgPageLoadTime: 1.2,
        slowestPages: [
          { page: "/products", loadTime: 2.1 },
          { page: "/checkout", loadTime: 1.8 },
          { page: "/", loadTime: 1.2 },
        ],
        errors: 12,
        errorRate: 0.22,
      },
      realTime: {
        activeUsers: 23,
        sessionsLastHour: 45,
        pageViewsLastHour: 187,
        ordersLastHour: 3,
      },
    };

    return NextResponse.json(mockData);
  } catch (error: any) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights data", details: error.message },
      { status: 500 }
    );
  }
}

// Helper functions to generate mock data
function generateDailyData(days: number, min: number, max: number) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.floor(Math.random() * (max - min + 1)) + min,
    });
  }
  return data;
}

function generateHourlyData() {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({
      hour: `${i}:00`,
      abandonments: Math.floor(Math.random() * 10) + 1,
    });
  }
  return hours;
}
