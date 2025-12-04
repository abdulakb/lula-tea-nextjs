import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeOutOfStock = searchParams.get("include_out_of_stock") === "true";

    // Fetch products from database
    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter out unavailable products unless specifically requested
    if (!includeOutOfStock) {
      query = query.eq("available", true);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Transform to match frontend format
    const transformedProducts = products?.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      nameAr: product.name_ar,
      description: product.description,
      descriptionAr: product.description_ar,
      price: parseFloat(product.price),
      currency: "SAR",
      image: product.image_url || "/images/Product Image2.jpg",
      stock: product.stock_quantity,
      available: product.available,
      trackInventory: product.track_inventory,
      allowBackorder: product.allow_backorder,
      lowStockThreshold: product.low_stock_threshold,
      isLowStock: product.stock_quantity <= product.low_stock_threshold,
      isOutOfStock: product.stock_quantity <= 0 && !product.allow_backorder,
    })) || [];

    return NextResponse.json({
      success: true,
      products: transformedProducts,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
