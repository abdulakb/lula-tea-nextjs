import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

// GET - Fetch all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log("=== Admin Orders API Called ===");
    console.log("Using supabaseAdmin:", !!supabaseAdmin);
    console.log("Has service key:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Orders fetch result:", {
      success: !error,
      orderCount: orders?.length || 0,
      error: error?.message
    });

    if (error) {
      console.error("Supabase error fetching orders:", error);
      throw error;
    }

    console.log("Returning orders:", orders?.length || 0);
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
