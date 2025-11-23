"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsMetrics {
  uniqueVisitors: number;
  pageViews: number;
  addToCartEvents: number;
  checkoutStarts: number;
  purchases: number;
  conversionRate: string;
  cartConversionRate: string;
  checkoutAbandonmentRate: string;
  abandonedCheckouts: number;
  visitorsWithoutPurchase: number;
  avgSessionDuration: number;
  timeOfDayData: { [key: number]: number };
  dayOfWeekData: { [key: number]: number };
}

interface AnalyticsEvent {
  id: string;
  event_type: string;
  page_url: string;
  created_at: string;
  event_data: any;
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // days
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    uniqueVisitors: 0,
    pageViews: 0,
    addToCartEvents: 0,
    checkoutStarts: 0,
    purchases: 0,
    conversionRate: "0",
    cartConversionRate: "0",
    checkoutAbandonmentRate: "0",
    abandonedCheckouts: 0,
    visitorsWithoutPurchase: 0,
    avgSessionDuration: 0,
    timeOfDayData: {},
    dayOfWeekData: {},
  });
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin");
      return;
    }
    fetchAnalytics();
  }, [router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/track?days=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics);
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareTimeSeriesData = () => {
    const dailyData: Record<string, any> = {};

    events.forEach((event) => {
      const date = new Date(event.created_at).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          views: 0,
          addToCarts: 0,
          checkouts: 0,
          purchases: 0,
        };
      }

      if (event.event_type === "page_view") dailyData[date].views++;
      if (event.event_type === "add_to_cart") dailyData[date].addToCarts++;
      if (event.event_type === "checkout_start") dailyData[date].checkouts++;
      if (event.event_type === "purchase") dailyData[date].purchases++;
    });

    return Object.values(dailyData).slice(-7); // Last 7 days
  };

  const prepareFunnelData = () => {
    return [
      { name: "Page Views", value: metrics.pageViews, color: "#7a9b76" },
      { name: "Add to Cart", value: metrics.addToCartEvents, color: "#6b4423" },
      { name: "Checkout", value: metrics.checkoutStarts, color: "#f59e0b" },
      { name: "Purchase", value: metrics.purchases, color: "#10b981" },
    ];
  };

  const preparePageData = () => {
    const pageCounts: Record<string, number> = {};

    events
      .filter((e) => e.event_type === "page_view")
      .forEach((event) => {
        const page = event.page_url || "/";
        pageCounts[page] = (pageCounts[page] || 0) + 1;
      });

    return Object.entries(pageCounts)
      .map(([page, count]) => ({ page, views: count }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-green mx-auto mb-4"></div>
          <p className="text-tea-brown">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const timeSeriesData = prepareTimeSeriesData();
  const funnelData = prepareFunnelData();
  const pageData = preparePageData();

  return (
    <div className="min-h-screen bg-warm-cream py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-deep-brown mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-tea-brown">Track visitor behavior and conversions</p>
          </div>
          <div className="flex gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
            <Link
              href="/admin"
              className="bg-tea-brown text-white px-6 py-2 rounded-lg hover:bg-tea-brown/90 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-tea-brown font-medium">Unique Visitors</h3>
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown">
              {metrics.uniqueVisitors}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-tea-brown font-medium">Page Views</h3>
              <svg
                className="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown">
              {metrics.pageViews}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-tea-brown font-medium">Conversion Rate</h3>
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown">
              {metrics.conversionRate}%
            </p>
            <p className="text-sm text-tea-brown mt-1">Visitor to Purchase</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-tea-brown font-medium">Cart Conversion</h3>
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown">
              {metrics.cartConversionRate}%
            </p>
            <p className="text-sm text-tea-brown mt-1">Cart to Purchase</p>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-deep-brown mb-6">
              Conversion Funnel
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#7a9b76" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-deep-brown mb-6">
              Top Pages
            </h2>
            <div className="space-y-4">
              {pageData.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-deep-brown">{page.page}</p>
                    <div className="w-full bg-warm-cream rounded-full h-2 mt-2">
                      <div
                        className="bg-tea-green h-2 rounded-full"
                        style={{
                          width: `${(page.views / pageData[0].views) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-4 font-bold text-tea-green">
                    {page.views}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-deep-brown mb-6">
            Activity Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#7a9b76"
                strokeWidth={2}
                name="Page Views"
              />
              <Line
                type="monotone"
                dataKey="addToCarts"
                stroke="#6b4423"
                strokeWidth={2}
                name="Add to Cart"
              />
              <Line
                type="monotone"
                dataKey="checkouts"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Checkouts"
              />
              <Line
                type="monotone"
                dataKey="purchases"
                stroke="#10b981"
                strokeWidth={2}
                name="Purchases"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Behavior Insights - New Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Session & Engagement Metrics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-deep-brown mb-6">
              Session & Engagement
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-warm-cream rounded-lg">
                <div>
                  <p className="text-tea-brown font-medium">Avg Session Duration</p>
                  <p className="text-sm text-tea-brown/70">Time spent on site</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-deep-brown">
                    {Math.floor(metrics.avgSessionDuration / 60)}m {metrics.avgSessionDuration % 60}s
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-warm-cream rounded-lg">
                <div>
                  <p className="text-tea-brown font-medium">Visitors Without Orders</p>
                  <p className="text-sm text-tea-brown/70">Browse but didn't buy</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-deep-brown">
                    {metrics.visitorsWithoutPurchase}
                  </p>
                  <p className="text-sm text-tea-brown/70">
                    {metrics.uniqueVisitors > 0 ? ((metrics.visitorsWithoutPurchase / metrics.uniqueVisitors) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-warm-cream rounded-lg">
                <div>
                  <p className="text-tea-brown font-medium">Abandoned Checkouts</p>
                  <p className="text-sm text-tea-brown/70">Started but didn't complete</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-500">
                    {metrics.abandonedCheckouts}
                  </p>
                  <p className="text-sm text-tea-brown/70">
                    {metrics.checkoutAbandonmentRate}% abandonment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Time of Day Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-deep-brown mb-6">
              Peak Activity Hours
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(metrics.timeOfDayData || {}).map(([hour, count]) => ({
                hour: `${hour}:00`,
                activity: count
              })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activity" fill="#7a9b76" name="Events" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-tea-brown text-center mt-4">
              Track when visitors are most active throughout the day
            </p>
          </div>
        </div>

        {/* Day of Week Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-deep-brown mb-6">
            Activity by Day of Week
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(metrics.dayOfWeekData || {}).map(([day, count]) => ({
              day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(day)],
              activity: count
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="activity" fill="#6b4423" name="Events" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-tea-brown text-center mt-4">
            Identify which days drive the most traffic and conversions
          </p>
        </div>

        {/* User Journey Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-500 mb-2">
              {metrics.addToCartEvents}
            </div>
            <p className="text-tea-brown">Items Added to Cart</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-yellow-500 mb-2">
              {metrics.checkoutStarts}
            </div>
            <p className="text-tea-brown">Checkout Started</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">
              {metrics.purchases}
            </div>
            <p className="text-tea-brown">Completed Purchases</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-500 mb-2">
              {(
                (metrics.pageViews / (metrics.uniqueVisitors || 1))
              ).toFixed(1)}
            </div>
            <p className="text-tea-brown">Pages per Visit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
