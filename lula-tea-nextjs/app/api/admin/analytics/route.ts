import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; // day, week, month, year

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch all orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    // Calculate metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeekStart = new Date();
    thisWeekStart.setDate(today.getDate() - today.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayOrders = orders?.filter(o => 
      new Date(o.created_at) >= today
    ) || [];
    
    const weekOrders = orders?.filter(o => 
      new Date(o.created_at) >= thisWeekStart
    ) || [];
    
    const monthOrders = orders?.filter(o => 
      new Date(o.created_at) >= thisMonthStart
    ) || [];

    // Calculate revenue (exclude cancelled orders)
    const calculateRevenue = (orderList: any[]) => 
      orderList
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    const totalRevenue = calculateRevenue(orders || []);
    const todayRevenue = calculateRevenue(todayOrders);
    const weekRevenue = calculateRevenue(weekOrders);
    const monthRevenue = calculateRevenue(monthOrders);

    // Get order status breakdown
    const statusBreakdown = {
      pending: orders?.filter(o => o.status === "pending").length || 0,
      processing: orders?.filter(o => o.status === "processing").length || 0,
      shipped: orders?.filter(o => o.status === "shipped").length || 0,
      delivered: orders?.filter(o => o.status === "delivered").length || 0,
      cancelled: orders?.filter(o => o.status === "cancelled").length || 0,
    };

    // Calculate product sales (from order_details)
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    orders?.forEach(order => {
      if (order.order_details && Array.isArray(order.order_details)) {
        order.order_details.forEach((item: any) => {
          const key = item.product_name || "Unknown Product";
          const existing = productSales.get(key) || { name: key, quantity: 0, revenue: 0 };
          existing.quantity += item.quantity || 0;
          existing.revenue += (item.quantity || 0) * (item.unit_price || 0);
          productSales.set(key, existing);
        });
      }
    });

    const bestSellingProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Group orders by date for chart
    const ordersByDate = new Map<string, { orders: number; revenue: number }>();
    
    orders?.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      const existing = ordersByDate.get(date) || { orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += parseFloat(order.total || 0);
      ordersByDate.set(date, existing);
    });

    const chartData = Array.from(ordersByDate.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Customer insights
    const customerMap = new Map<string, { orders: number; totalSpent: number; email: string }>();
    
    orders?.forEach(order => {
      const email = order.email || "Unknown";
      const existing = customerMap.get(email) || { orders: 0, totalSpent: 0, email };
      existing.orders += 1;
      existing.totalSpent += parseFloat(order.total || 0);
      customerMap.set(email, existing);
    });

    const repeatCustomers = Array.from(customerMap.values()).filter(c => c.orders > 1);
    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    const analytics = {
      summary: {
        totalOrders: orders?.length || 0,
        todayOrders: todayOrders.length,
        weekOrders: weekOrders.length,
        monthOrders: monthOrders.length,
        totalRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        averageOrderValue: totalRevenue / (orders?.length || 1),
      },
      statusBreakdown,
      bestSellingProducts,
      chartData,
      customerInsights: {
        totalCustomers: customerMap.size,
        repeatCustomers: repeatCustomers.length,
        repeatCustomerRate: (repeatCustomers.length / customerMap.size) * 100 || 0,
        topCustomers,
      },
    };

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics", details: error.message },
      { status: 500 }
    );
  }
}
