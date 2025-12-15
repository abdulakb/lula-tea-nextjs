import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { cancelOrderSchema, formatZodErrors } from "@/lib/validations";
import { generateOrderCancellationEmail } from "@/lib/authEmailTemplates";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Check if an order can be cancelled
 * - Order must be placed on the same day
 * - Order status must be "processing" or "pending"
 */
function canCancelOrder(order: any): { allowed: boolean; reason?: string } {
  const today = new Date();
  const orderDate = new Date(order.created_at);
  
  // Check if same day
  const isSameDay = 
    orderDate.getFullYear() === today.getFullYear() &&
    orderDate.getMonth() === today.getMonth() &&
    orderDate.getDate() === today.getDate();

  if (!isSameDay) {
    return {
      allowed: false,
      reason: "Orders can only be cancelled on the same day they were placed",
    };
  }

  // Check status
  const validStatuses = ["processing", "pending"];
  if (!validStatuses.includes(order.status)) {
    return {
      allowed: false,
      reason: `Orders with status "${order.status}" cannot be cancelled`,
    };
  }

  return { allowed: true };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.customerId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = cancelOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          errors: formatZodErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    // Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", id)
      .eq("customer_id", session.customerId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    const cancellationCheck = canCancelOrder(order);
    if (!cancellationCheck.allowed) {
      return NextResponse.json(
        { error: cancellationCheck.reason },
        { status: 400 }
      );
    }

    // Parse items for inventory restocking
    const items = typeof order.items === "string" 
      ? JSON.parse(order.items) 
      : order.items;

    // Restock inventory for each item
    const restockResults = [];
    for (const item of items) {
      try {
        const { data: restockResult, error: restockError } = await supabase
          .rpc('restock_product', {
            p_product_id: item.id,
            p_quantity: item.quantity,
            p_order_id: order.order_id
          });

        if (restockError) {
          console.error(`Error restocking item ${item.id}:`, restockError);
          restockResults.push({
            item: item.name,
            success: false,
            error: restockError.message,
          });
        } else {
          restockResults.push({
            item: item.name,
            success: true,
            ...restockResult,
          });
        }
      } catch (err) {
        console.error(`Exception restocking item ${item.name}:`, err);
        restockResults.push({
          item: item.name,
          success: false,
          error: String(err),
        });
      }
    }

    console.log("Restock results:", restockResults);

    // Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        can_cancel: false,
      })
      .eq("order_id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error cancelling order:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel order" },
        { status: 500 }
      );
    }

    // Send cancellation confirmation email
    if (order.customer_email && process.env.RESEND_API_KEY) {
      try {
        const cancellationEmail = generateOrderCancellationEmail(
          order.order_id,
          order.customer_name,
          reason,
          "en" // TODO: Get language preference
        );
        
        await resend.emails.send({
          from: "Lula Tea <orders@lulatee.com>",
          to: order.customer_email,
          subject: cancellationEmail.subject,
          html: cancellationEmail.html,
        });
      } catch (emailError) {
        console.error("Error sending cancellation email:", emailError);
        // Don't fail - cancellation was successful
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order cancelled successfully. Inventory has been restocked.",
        order: updatedOrder,
        restockResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
