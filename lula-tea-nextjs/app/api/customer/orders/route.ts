import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.customerId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(parseInt(searchParams.get("perPage") || "10"), 50);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const offset = (page - 1) * perPage;

    // Build query
    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("customer_id", session.customerId)
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Search by order ID or customer name if provided
    if (search) {
      query = query.or(`order_id.ilike.%${search}%,customer_name.ilike.%${search}%`);
    }

    const { data: orders, error: ordersError, count } = await query;

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orders: orders || [],
        pagination: {
          page,
          perPage,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / perPage),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
