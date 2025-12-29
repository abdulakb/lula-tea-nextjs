import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city"); // "Riyadh" or "Jeddah"
    const productId = searchParams.get("productId");

    if (!city || (city !== "Riyadh" && city !== "Jeddah")) {
      return NextResponse.json(
        { error: "Valid city (Riyadh or Jeddah) is required" },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from("products")
      .select("id, name, name_ar, riyadh_stock, jeddah_stock, stock_quantity, low_stock_threshold, available")
      .eq("available", true);

    // Filter by specific product if provided
    if (productId) {
      query = query.eq("id", productId);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Error fetching city stock:", error);
      return NextResponse.json(
        { error: "Failed to fetch city stock" },
        { status: 500 }
      );
    }

    // Transform products to include city-specific stock
    const transformedProducts = products?.map((product) => {
      const cityStock = city === "Riyadh" ? product.riyadh_stock : product.jeddah_stock;
      
      return {
        id: product.id,
        name: product.name,
        nameAr: product.name_ar,
        city,
        stock: cityStock || 0,
        totalStock: product.stock_quantity,
        available: product.available && cityStock > 0,
        isLowStock: cityStock <= product.low_stock_threshold && cityStock > 0,
        isOutOfStock: cityStock <= 0,
        // Only show stock number if less than 10 (for marketing)
        showStockCount: cityStock < 10 && cityStock > 0,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      city,
      products: transformedProducts,
    });
  } catch (error) {
    console.error("City stock API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch city stock" },
      { status: 500 }
    );
  }
}
