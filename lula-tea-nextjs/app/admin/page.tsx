"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated, setAdminAuthenticated, verifyAdminPassword } from "@/lib/adminAuth";

interface Analytics {
  summary: {
    totalOrders: number;
    todayOrders: number;
    weekOrders: number;
    monthOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    averageOrderValue: number;
  };
  statusBreakdown: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  bestSellingProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  chartData: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  customerInsights: {
    totalCustomers: number;
    repeatCustomers: number;
    repeatCustomerRate: number;
    topCustomers: Array<{
      email: string;
      orders: number;
      totalSpent: number;
    }>;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    const authenticated = isAdminAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalytics(data);
      } else {
        console.error("Failed to fetch analytics:", data.error);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (verifyAdminPassword(password)) {
      setAdminAuthenticated();
      setIsAuthenticated(true);
      fetchAnalytics();
    } else {
      setError("Invalid password");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-deep-brown mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-deep-brown mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-tea-green text-white py-3 rounded-lg font-semibold hover:bg-tea-green/90 transition-colors"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-sm text-tea-brown text-center">
            Default password: lulatea2024 (change in env)
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-green mx-auto mb-4"></div>
          <p className="text-tea-brown">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <p className="text-tea-brown">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-deep-brown mb-2">
              Admin Dashboard
            </h1>
            <p className="text-tea-brown">Welcome back! Here's your business overview.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white text-deep-brown"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
            <Link
              href="/"
              className="bg-tea-brown text-white px-6 py-2 rounded-lg hover:bg-tea-brown/90 transition-colors"
            >
              Back to Site
            </Link>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Today</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.summary.todayOrders}</p>
            <p className="text-sm opacity-90">{formatCurrency(analytics.summary.todayRevenue)}</p>
          </div>

          {/* This Week */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">This Week</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.summary.weekOrders}</p>
            <p className="text-sm opacity-90">{formatCurrency(analytics.summary.weekRevenue)}</p>
          </div>

          {/* This Month */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">This Month</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.summary.monthOrders}</p>
            <p className="text-sm opacity-90">{formatCurrency(analytics.summary.monthRevenue)}</p>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">All Time</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-1">{analytics.summary.totalOrders}</p>
            <p className="text-sm opacity-90">{formatCurrency(analytics.summary.totalRevenue)}</p>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-deep-brown mb-6">Order Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="bg-yellow-100 text-yellow-800 rounded-lg p-4 mb-2">
                <p className="text-3xl font-bold">{analytics.statusBreakdown.pending}</p>
              </div>
              <p className="text-sm text-tea-brown font-medium">Pending</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 rounded-lg p-4 mb-2">
                <p className="text-3xl font-bold">{analytics.statusBreakdown.processing}</p>
              </div>
              <p className="text-sm text-tea-brown font-medium">Processing</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-800 rounded-lg p-4 mb-2">
                <p className="text-3xl font-bold">{analytics.statusBreakdown.shipped}</p>
              </div>
              <p className="text-sm text-tea-brown font-medium">Shipped</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-800 rounded-lg p-4 mb-2">
                <p className="text-3xl font-bold">{analytics.statusBreakdown.delivered}</p>
              </div>
              <p className="text-sm text-tea-brown font-medium">Delivered</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 text-red-800 rounded-lg p-4 mb-2">
                <p className="text-3xl font-bold">{analytics.statusBreakdown.cancelled}</p>
              </div>
              <p className="text-sm text-tea-brown font-medium">Cancelled</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Best Selling Products */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-deep-brown mb-6">Best Selling Products</h2>
            <div className="space-y-4">
              {analytics.bestSellingProducts.length > 0 ? (
                analytics.bestSellingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-deep-brown">{product.name}</p>
                      <p className="text-sm text-tea-brown">{product.quantity} units sold</p>
                    </div>
                    <p className="font-bold text-tea-green">{formatCurrency(product.revenue)}</p>
                  </div>
                ))
              ) : (
                <p className="text-tea-brown text-center py-4">No product data available</p>
              )}
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-deep-brown mb-6">Customer Insights</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-tea-brown">Total Customers</span>
                <span className="font-bold text-deep-brown">{analytics.customerInsights.totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-tea-brown">Repeat Customers</span>
                <span className="font-bold text-deep-brown">{analytics.customerInsights.repeatCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-tea-brown">Repeat Rate</span>
                <span className="font-bold text-tea-green">{analytics.customerInsights.repeatCustomerRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-tea-brown">Avg Order Value</span>
                <span className="font-bold text-deep-brown">{formatCurrency(analytics.summary.averageOrderValue)}</span>
              </div>
            </div>
            
            <h3 className="font-semibold text-deep-brown mb-3">Top Customers</h3>
            <div className="space-y-2">
              {analytics.customerInsights.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex-1 truncate">
                    <p className="text-deep-brown truncate">{customer.email}</p>
                    <p className="text-xs text-tea-brown">{customer.orders} orders</p>
                  </div>
                  <p className="font-semibold text-tea-green ml-2">{formatCurrency(customer.totalSpent)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-tea-green/10 p-4 rounded-lg">
                <svg className="w-8 h-8 text-tea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-deep-brown mb-1">
                  Manage Orders
                </h3>
                <p className="text-tea-brown text-sm">
                  View, update, and process orders
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-4 rounded-lg">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-deep-brown mb-1">
                  Analytics
                </h3>
                <p className="text-tea-brown text-sm">
                  View detailed reports & charts
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem('adminAuthenticated');
              router.push('/');
            }}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-500/10 p-4 rounded-lg">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-deep-brown mb-1">
                  Logout
                </h3>
                <p className="text-tea-brown text-sm">
                  Sign out from admin panel
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

