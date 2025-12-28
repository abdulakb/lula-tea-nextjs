import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function DELETE(req: NextRequest) {
  try {
    const { orderId, orderIds } = await req.json();

    // Handle single order deletion
    if (orderId) {
      const { error } = await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) {
        console.error("Error deleting order:", error);
        return NextResponse.json(
          { error: "Failed to delete order" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Handle bulk deletion
    if (orderIds && Array.isArray(orderIds)) {
      const { error } = await supabaseAdmin
        .from("orders")
        .delete()
        .in("id", orderIds);

      if (error) {
        console.error("Error deleting orders:", error);
        return NextResponse.json(
          { error: "Failed to delete orders" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, count: orderIds.length });
    }

    return NextResponse.json(
      { error: "Invalid request - missing orderId or orderIds" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in delete orders API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
