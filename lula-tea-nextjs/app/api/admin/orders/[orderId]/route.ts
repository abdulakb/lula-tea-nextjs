import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

// PUT - Update order details (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { subtotal, delivery_fee, total, quantity_ordered } = body;

    console.log("Updating order:", orderId, body);

    // Validate required fields
    if (subtotal === undefined || total === undefined) {
      return NextResponse.json(
        { error: "Subtotal and total are required" },
        { status: 400 }
      );
    }

    // Update order in database
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        subtotal,
        delivery_fee: delivery_fee || 0,
        total,
        quantity_ordered: quantity_ordered || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json(
        { error: "Failed to update order", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.log("Order updated successfully:", data.id);

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/orders/[orderId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
