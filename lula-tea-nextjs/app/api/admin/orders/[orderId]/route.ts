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

    // Get current order data for audit log
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("subtotal, delivery_fee, total, quantity_ordered")
      .eq("order_id", orderId)
      .single();

    if (fetchError || !currentOrder) {
      console.error("Error fetching current order:", fetchError);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Log the change to order_history
    const { error: historyError } = await supabaseAdmin
      .from("order_history")
      .insert({
        order_id: orderId,
        change_type: "amount_edit",
        old_values: {
          subtotal: currentOrder.subtotal,
          delivery_fee: currentOrder.delivery_fee,
          total: currentOrder.total,
          quantity_ordered: currentOrder.quantity_ordered
        },
        new_values: {
          subtotal,
          delivery_fee: delivery_fee || 0,
          total,
          quantity_ordered: quantity_ordered || 0
        }
      });

    if (historyError) {
      console.error("Error logging to history:", historyError);
      // Continue with update even if history fails
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

    console.log("✅ Order updated successfully:", data.id);

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
