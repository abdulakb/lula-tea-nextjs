import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

/**
 * Adjust product stock with audit trail (city-specific)
 * POST /api/admin/products/adjust-stock
 * Body: { 
 *   productId: string, 
 *   adjustment: number (positive for add, negative for remove),
 *   city: "riyadh" | "jeddah",
 *   reason: string,
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { productId, adjustment, city, reason, notes } = await request.json();

    // Validate input
    if (!productId || adjustment === undefined || !city || !reason) {
      return NextResponse.json(
        { error: "Product ID, adjustment amount, city, and reason are required" },
        { status: 400 }
      );
    }

    if (city !== "riyadh" && city !== "jeddah") {
      return NextResponse.json(
        { error: "City must be 'riyadh' or 'jeddah'" },
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
    const { data: product, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("stock_quantity, riyadh_stock, jeddah_stock, name")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      console.error("Error fetching product:", fetchError);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const cityStockField = city === "riyadh" ? "riyadh_stock" : "jeddah_stock";
    const currentCityStock = product[cityStockField] || 0;
    const newCityStock = currentCityStock + adjustmentNum;

    // Prevent negative stock
    if (newCityStock < 0) {
      return NextResponse.json(
        { 
          error: `Cannot adjust stock. Current ${city} stock: ${currentCityStock}, Adjustment: ${adjustmentNum}. Result would be negative.`,
          currentStock: currentCityStock,
          adjustment: adjustmentNum,
          newStock: newCityStock
        },
        { status: 400 }
      );
    }

    // Calculate new total stock
    const otherCityStock = city === "riyadh" ? product.jeddah_stock : product.riyadh_stock;
    const newTotalStock = newCityStock + (otherCityStock || 0);

    // Update product stock for specific city and total
    const updateData: any = {
      [cityStockField]: newCityStock,
      stock_quantity: newTotalStock,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", productId);

    if (updateError) {
      console.error("Error updating product stock:", updateError);
      return NextResponse.json(
        { error: "Failed to update stock" },
        { status: 500 }
      );
    }

    // Create audit trail in stock_movements
    const { error: auditError } = await supabaseAdmin
      .from("stock_movements")
      .insert([{
        product_id: productId,
        order_id: null,
        movement_type: adjustmentNum > 0 ? "restock" : "adjustment",
        quantity: adjustmentNum,
        previous_stock: currentCityStock,
        new_stock: newCityStock,
        notes: notes ? `${city.toUpperCase()}: ${reason} - ${notes}` : `${city.toUpperCase()}: ${reason}`,
        created_by: "admin",
        created_at: new Date().toISOString()
      }]);

    if (auditError) {
      console.error("Error creating stock movement record:", auditError);
      // Don't fail the request if audit trail fails
    }

    console.log(`✅ Stock adjusted for ${product.name} (${city.toUpperCase()}): ${currentCityStock} → ${newCityStock} (${adjustmentNum > 0 ? '+' : ''}${adjustmentNum})`);

    return NextResponse.json({
      success: true,
      productName: product.name,
      city: city,
      previousStock: currentCityStock,
      adjustment: adjustmentNum,
      newStock: newCityStock,
      totalStock: newTotalStock,
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
