import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * Adjust product stock with audit trail
 * POST /api/admin/products/adjust-stock
 * Body: { 
 *   productId: string, 
 *   adjustment: number (positive for add, negative for remove),
 *   reason: string,
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, adjustment, reason, notes } = await request.json();

    // Validate input
    if (!productId || adjustment === undefined || !reason) {
      return NextResponse.json(
        { error: "Product ID, adjustment amount, and reason are required" },
        { status: 400 }
      );
    }

    const adjustmentNum = parseInt(adjustment);
    if (isNaN(adjustmentNum)) {
      return NextResponse.json(
        { error: "Adjustment must be a valid number" },
        { status: 400 }
      );
    }

    // Get current product stock
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("stock_quantity, name")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      console.error("Error fetching product:", fetchError);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const currentStock = product.stock_quantity || 0;
    const newStock = currentStock + adjustmentNum;

    // Prevent negative stock
    if (newStock < 0) {
      return NextResponse.json(
        { 
          error: `Cannot adjust stock. Current stock: ${currentStock}, Adjustment: ${adjustmentNum}. Result would be negative.`,
          currentStock,
          adjustment: adjustmentNum,
          newStock
        },
        { status: 400 }
      );
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from("products")
      .update({ 
        stock_quantity: newStock,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId);

    if (updateError) {
      console.error("Error updating product stock:", updateError);
      return NextResponse.json(
        { error: "Failed to update stock" },
        { status: 500 }
      );
    }

    // Create audit trail in stock_movements
    const { error: auditError } = await supabase
      .from("stock_movements")
      .insert([{
        product_id: productId,
        order_id: null,
        movement_type: adjustmentNum > 0 ? "restock" : "adjustment",
        quantity: adjustmentNum,
        previous_stock: currentStock,
        new_stock: newStock,
        notes: notes ? `${reason}: ${notes}` : reason,
        created_by: "admin",
        created_at: new Date().toISOString()
      }]);

    if (auditError) {
      console.error("Error creating stock movement record:", auditError);
      // Don't fail the request if audit trail fails
    }

    console.log(`✅ Stock adjusted for ${product.name}: ${currentStock} → ${newStock} (${adjustmentNum > 0 ? '+' : ''}${adjustmentNum})`);

    return NextResponse.json({
      success: true,
      productName: product.name,
      previousStock: currentStock,
      adjustment: adjustmentNum,
      newStock: newStock,
      reason: reason
    }, { status: 200 });

  } catch (error) {
    console.error("Stock adjustment error:", error);
    return NextResponse.json(
      { error: "Failed to adjust stock" },
      { status: 500 }
    );
  }
}
