"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabaseClient";

const ThemeToggle = dynamic(() => import("@/app/components/ThemeToggle"), {
  ssr: false,
});

interface Customer {
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  firstOrder: string;
  lastOrder: string;
  averageOrderValue: number;
}

export default function CustomersManagement() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"orders" | "spent" | "recent">("spent");

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin");
      return;
    }
    fetchCustomers();
  }, [router]);

  const fetchCustomers = async () => {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group orders by customer
      const customerMap = new Map<string, Customer>();

      orders?.forEach(order => {
        const key = order.email || order.customer_phone || order.customer_name;
        const existing = customerMap.get(key);

        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += parseFloat(order.total || 0);
          existing.lastOrder = order.created_at;
        } else {
          customerMap.set(key, {
            email: order.email || "",
            name: order.customer_name,
            phone: order.customer_phone,
            totalOrders: 1,
            totalSpent: parseFloat(order.total || 0),
            firstOrder: order.created_at,
            lastOrder: order.created_at,
            averageOrderValue: parseFloat(order.total || 0),
          });
        }
      });

      // Calculate average order values
      const customerList = Array.from(customerMap.values()).map(customer => ({
        ...customer,
        averageOrderValue: customer.totalSpent / customer.totalOrders,
      }));

      setCustomers(customerList);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter((customer) => {
      const searchLower = search.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(search) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "orders":
          return b.totalOrders - a.totalOrders;
        case "spent":
          return b.totalSpent - a.totalSpent;
        case "recent":
          return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime();
        default:
          return 0;
      }
    });

  const repeatCustomers = customers.filter(c => c.totalOrders > 1);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageLifetimeValue = totalRevenue / (customers.length || 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream dark:bg-gray-900 flex items-center justify-center dark-transition">
        <ThemeToggle />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-green mx-auto mb-4"></div>
          <p className="text-tea-brown dark:text-gray-300">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream dark:bg-gray-900 py-8 md:py-20 px-4 dark-transition">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-deep-brown dark:text-deep-brown mb-2">
              Customer Management
            </h1>
            <p className="text-tea-brown dark:text-gray-400">View customer insights and order history</p>
          </div>
          <Link
            href="/admin"
            className="bg-tea-brown text-white px-6 py-2 rounded-lg hover:bg-tea-brown/90 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 dark-transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-tea-brown dark:text-gray-400 font-medium text-sm">Total Customers</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown dark:text-white">{customers.length}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 dark-transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-tea-brown dark:text-gray-400 font-medium text-sm">Repeat Customers</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown dark:text-white">{repeatCustomers.length}</p>
            <p className="text-sm text-tea-brown dark:text-gray-400 mt-1">
              {((repeatCustomers.length / customers.length) * 100 || 0).toFixed(1)}% retention
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 dark-transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-tea-brown dark:text-gray-400 font-medium text-sm">Avg Lifetime Value</h3>
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown dark:text-white">
              {averageLifetimeValue.toFixed(0)} SAR
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 dark-transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-tea-brown dark:text-gray-400 font-medium text-sm">Total Revenue</h3>
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-deep-brown dark:text-white">
              {totalRevenue.toFixed(0)} SAR
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 dark-transition">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                Search Customers
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, or phone..."
                className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white dark-transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-brown dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-tea-brown/30 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-800 text-deep-brown dark:text-white dark-transition"
              >
                <option value="spent">Highest Spending</option>
                <option value="orders">Most Orders</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden dark-transition">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tea-green text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Orders</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Total Spent</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Avg Order</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Last Order</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-tea-brown dark:text-gray-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <tr key={index} className="hover:bg-warm-cream/30 dark:hover:bg-gray-700/30 dark-transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-deep-brown dark:text-white">{customer.name}</p>
                          {customer.email && (
                            <p className="text-sm text-tea-brown dark:text-gray-400">{customer.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-tea-brown dark:text-gray-300">
                        <a
                          href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#25D366] hover:underline"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                          {customer.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-tea-green/20 text-tea-green font-semibold">
                          {customer.totalOrders}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-deep-brown dark:text-white">
                        {customer.totalSpent.toFixed(2)} SAR
                      </td>
                      <td className="px-6 py-4 text-right text-tea-brown dark:text-gray-300">
                        {customer.averageOrderValue.toFixed(2)} SAR
                      </td>
                      <td className="px-6 py-4 text-sm text-tea-brown dark:text-gray-300">
                        {new Date(customer.lastOrder).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {customer.totalOrders > 1 ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Repeat
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            New
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 text-tea-brown dark:text-gray-400 text-sm">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>
    </div>
  );
}
