"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface InsightsData {
  visitors: any;
  pageViews: any;
  shopping: any;
  abandonment: any;
  devices: any;
  browsers: any;
  geography: any;
  performance: any;
  realTime: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function InsightsDashboard() {
  const router = useRouter();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin");
      return;
    }
    fetchInsights();
  }, [router, timeRange]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/insights?days=${timeRange}`);
      const result = await response.json();
      
      if (response.ok) {
        setData(result);
      } else {
        console.error("Failed to fetch insights:", result.error);
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-warm-cream dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-green mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Analytics Insights
            </h1>
            <p className="text-gray-700 dark:text-gray-300">Real-time visitor and shopping behavior analytics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={1}>Last 24 Hours</option>
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
            <Link
              href="/admin"
              className="px-6 py-2 bg-tea-brown text-white rounded-lg hover:bg-tea-brown/90 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Real-Time Stats */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-4">🔴 Live Right Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm opacity-90">Active Users</p>
              <p className="text-3xl font-bold">{data.realTime.activeUsers}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Sessions (Last Hour)</p>
              <p className="text-3xl font-bold">{data.realTime.sessionsLastHour}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Page Views (Last Hour)</p>
              <p className="text-3xl font-bold">{data.realTime.pageViewsLastHour}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Orders (Last Hour)</p>
              <p className="text-3xl font-bold">{data.realTime.ordersLastHour}</p>
            </div>
          </div>
        </div>

        {/* Visitor Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Visitors</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.visitors.total.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-2">👤 {data.visitors.unique.toLocaleString()} unique</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">New Visitors</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.visitors.new.toLocaleString()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{((data.visitors.new / data.visitors.total) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Page Views</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.pageViews.total.toLocaleString()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{data.pageViews.avgPerSession} avg per session</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Conversion Rate</p>
            <p className="text-3xl font-bold text-green-600">{data.shopping.conversionRate}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{data.shopping.checkoutCompleted} completed orders</p>
          </div>
        </div>

        {/* Visitor Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📈 Visitor Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.visitors.byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#2d5016" strokeWidth={2} name="Visitors" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Shopping Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🛒 Shopping Funnel</h2>
            <div className="space-y-4">
              {data.shopping.funnel.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">{item.stage}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.count} ({item.rate}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-tea-green h-4 rounded-full transition-all"
                      style={{ width: `${item.rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Abandonment Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🚫 Checkout Abandonment</h2>
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-red-600">{data.shopping.abandonmentRate}%</p>
              <p className="text-gray-600 dark:text-gray-400">Abandonment Rate</p>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-gray-900 dark:text-white">Top Reasons:</p>
              {data.abandonment.reasons.map((reason: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">{reason.reason.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{reason.count} ({reason.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📄 Most Visited Pages</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Page</th>
                  <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Views</th>
                  <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">Unique Visitors</th>
                </tr>
              </thead>
              <tbody>
                {data.pageViews.topPages.map((page: any, index: number) => (
                  <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{page.page}</td>
                    <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{page.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{page.uniqueVisitors.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device & Browser Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📱 Devices</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Desktop', value: data.devices.desktop },
                    { name: 'Mobile', value: data.devices.mobile },
                    { name: 'Tablet', value: data.devices.tablet },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🌐 Browsers</h2>
            <div className="space-y-4">
              {data.browsers.map((browser: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">{browser.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{browser.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-tea-green h-3 rounded-full"
                      style={{ width: `${browser.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geography */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🌍 Top Countries</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.geography.topCountries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visitors" fill="#2d5016" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🏙️ Top Cities</h2>
            <div className="space-y-3">
              {data.geography.topCities.map((city: any, index: number) => (
                <div key={index} className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                  <span className="text-gray-700 dark:text-gray-300">#{index + 1} {city.city}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{city.visitors.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">⚡ Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{data.performance.avgPageLoadTime}s</p>
              <p className="text-gray-600 dark:text-gray-400">Avg Page Load Time</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">{data.performance.errors}</p>
              <p className="text-gray-600 dark:text-gray-400">JavaScript Errors</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">{data.performance.errorRate}%</p>
              <p className="text-gray-600 dark:text-gray-400">Error Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
