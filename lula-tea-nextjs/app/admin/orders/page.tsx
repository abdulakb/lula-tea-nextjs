"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabaseClient";
import { generateOrderStatusEmail } from "@/lib/emailTemplates";

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  email?: string;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  items: any;
  notes?: string;
}

function OrdersManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin");
      return;
    }
    
    // Check for status filter from URL query parameter
    const statusParam = searchParams.get('status');
    if (statusParam && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(statusParam)) {
      setFilter(statusParam);
    }
    
    fetchOrders();
  }, [router, searchParams]);

  const fetchOrders = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/orders?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const { orders: data, error } = await response.json();

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: string, orderIdDisplay: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderIdDisplay}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      // Update local state
      setOrders(orders.filter(order => order.id !== orderId));
      
      // Remove from selected orders if it was selected
      const newSelectedOrders = new Set(selectedOrders);
      newSelectedOrders.delete(orderId);
      setSelectedOrders(newSelectedOrders);

      alert("Order deleted successfully!");
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      const order = orders.find(o => o.id === orderId);
      
      // Send email notification (if configured)
      if (order && order.email && process.env.NEXT_PUBLIC_ENABLE_EMAILS === "true") {
        const { subject, html } = generateOrderStatusEmail(
          order.order_id,
          order.customer_name,
          newStatus,
          "en"
        );

        await fetch("/api/emails/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: order.email,
            subject,
            html,
          }),
        });
      }

      // Send WhatsApp notification only for delivered status
      if (order && order.customer_phone && newStatus === "delivered") {
        try {
          const notificationResponse = await fetch("/api/orders/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              status: newStatus,
              sendNotification: true,
            }),
          });

          if (notificationResponse.ok) {
            const notificationData = await notificationResponse.json();
            
            console.log("WhatsApp notification response:", notificationData);
            
            // Check if message was auto-sent via Twilio
            if (notificationData.notificationSent && notificationData.autoSent) {
              alert(`✅ Status updated & WhatsApp sent automatically to ${order.customer_name}!`);
              return; // Don't show the generic success message
            } else if (notificationData.whatsappUrl) {
              // Twilio failed (sandbox restrictions) - show WhatsApp link prominently
              const sendNow = confirm(
                `✅ Status updated to Delivered!\n\n📱 Click OK to send WhatsApp message to ${order.customer_name}\n\nMessage: ${notificationData.preview || 'Delivery confirmation with review link'}`
              );
              
              if (sendNow) {
                // Use window.location for better compatibility (especially mobile)
                window.location.href = notificationData.whatsappUrl;
              } else {
                // Copy link to clipboard as backup
                navigator.clipboard.writeText(notificationData.whatsappUrl).then(() => {
                  alert('💡 WhatsApp link copied to clipboard! You can paste it in browser to send.');
                }).catch(() => {
                  // Fallback if clipboard fails
                  const copyLink = confirm(`WhatsApp link ready. Click OK to open it manually:\n\n${notificationData.whatsappUrl.substring(0, 100)}...`);
                  if (copyLink) {
                    window.location.href = notificationData.whatsappUrl;
                  }
                });
              }
              return; // Don't show the generic success message
            }
          }
        } catch (whatsappError) {
          console.error("WhatsApp notification error:", whatsappError);
          alert(`⚠️ Status updated but WhatsApp notification failed: ${whatsappError}`);
          return;
        }
      }

      alert("Order status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status");
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedOrders.size === 0 || !bulkStatus) {
      alert("Please select orders and a status");
      return;
    }

    if (!confirm(`Update ${selectedOrders.size} orders to ${bulkStatus}?`)) {
      return;
    }

    try {
      const orderIds = Array.from(selectedOrders);
      
      const { error } = await supabase
        .from("orders")
        .update({ status: bulkStatus })
        .in("id", orderIds);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        selectedOrders.has(order.id) ? { ...order, status: bulkStatus } : order
      ));

      setSelectedOrders(new Set());
      setBulkStatus("");
      setShowBulkActions(false);
      alert(`Successfully updated ${orderIds.length} orders!`);
    } catch (err) {
      console.error("Error updating bulk status:", err);
      alert("Failed to update orders");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) {
      alert("Please select orders to delete");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedOrders.size} orders? This action cannot be undone.`)) {
      return;
    }

    try {
      const orderIds = Array.from(selectedOrders);
      
      const response = await fetch('/api/admin/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });

      if (!response.ok) {
        throw new Error('Failed to delete orders');
      }

      // Update local state
      setOrders(orders.filter(order => !selectedOrders.has(order.id)));
      setSelectedOrders(new Set());
      setShowBulkActions(false);
      alert(`Successfully deleted ${orderIds.length} orders!`);
    } catch (err) {
      console.error("Error deleting orders:", err);
      alert("Failed to delete orders");
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredOrders.map((order) => {
      let items = [];
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (e) {
        items = [];
      }

      const itemsList = items.map((item: any) => 
        `${item.name || item.nameAr || 'Product'} (${item.quantity}x ${item.price} SAR)`
      ).join('; ');

      return {
        'Order ID': order.order_id,
        'Date': new Date(order.created_at).toLocaleDateString('en-US'),
        'Time': new Date(order.created_at).toLocaleTimeString('en-US'),
        'Customer Name': order.customer_name,
        'Phone': order.customer_phone,
        'Address': order.customer_address,
        'Items': itemsList,
        'Total (SAR)': order.total,
        'Payment Method': order.payment_method === 'cod' ? 'Cash on Delivery' : 
                         order.payment_method === 'stcpay' ? 'STC Pay' : 'WhatsApp',
        'Status': order.status.toUpperCase(),
        'Delivered': order.status === 'delivered' ? 'YES' : 'NO',
        'Payment Received': '', // Empty column for manual tracking
        'Notes': order.notes || ''
      };
    });

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row] || '';
          // Escape quotes and wrap in quotes if contains comma/newline
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesPaymentFilter = paymentFilter === "all" || order.payment_method === paymentFilter;
    const matchesSearch =
      order.order_id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_phone.includes(search);
    
    // Date range filter
    let matchesDateRange = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.created_at);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && orderDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && orderDate <= end;
      }
    }
    
    return matchesFilter && matchesPaymentFilter && matchesSearch && matchesDateRange;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-green mx-auto mb-4"></div>
          <p className="text-tea-brown">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-deep-brown mb-2">
              Orders Management
            </h1>
            <p className="text-tea-brown">View and manage all customer orders</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
            <Link
              href="/admin"
              className="bg-tea-brown text-white px-6 py-2 rounded-lg hover:bg-tea-brown/90 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-deep-brown mb-2">
                Search Orders
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order ID, customer name, or phone..."
                className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white text-deep-brown placeholder:text-tea-brown/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-brown mb-2">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white text-deep-brown"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-brown mb-2">
                Payment Method
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white text-deep-brown"
              >
                <option value="all">All Methods</option>
                <option value="cod">Cash on Delivery</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-brown mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-2 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green text-sm"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-2 py-2 border border-tea-brown/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green text-sm"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
          
          {/* Clear Filters */}
          {(search || filter !== "all" || paymentFilter !== "all" || startDate || endDate) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                  setPaymentFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-sm text-tea-brown hover:text-deep-brown underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="font-semibold text-deep-brown">
                  {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="flex-1 md:flex-initial px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-deep-brown"
                >
                  <option value="">Select Status...</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleBulkStatusUpdate}
                  disabled={!bulkStatus}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Update Status
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  title="Delete selected orders"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedOrders(new Set())}
                  className="px-4 py-2 text-tea-brown hover:text-deep-brown"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tea-green text-white">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-white focus:ring-2 focus:ring-white cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-tea-brown">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-warm-cream/30">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-tea-green cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-deep-brown">
                        {order.order_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-tea-brown">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-tea-brown">
                        {order.customer_phone}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-deep-brown">
                        {order.total} SAR
                      </td>
                      <td className="px-6 py-4 text-sm text-tea-brown">
                        {order.payment_method === "cod" ? "Cash on Delivery" : "WhatsApp"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-tea-brown">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-tea-green hover:text-tea-green/80 font-medium text-sm"
                          >
                            View
                          </Link>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs border border-tea-brown/30 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-tea-green text-deep-brown bg-white font-medium"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => deleteOrder(order.id, order.order_id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                            title="Delete order"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 flex justify-between items-center text-tea-brown text-sm">
          <div>
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
          <div className="text-right">
            <span className="font-semibold">Total Value: </span>
            {filteredOrders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0).toFixed(2)} SAR
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersManagement() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrdersManagementContent />
    </Suspense>
  );
}
