import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET - Fetch all products (admin can see all, public sees only available)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get("admin") === "true";

    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    // If not admin view, only show available products
    if (!adminView) {
      query = query.eq("available", true);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();

    const { data: product, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create product", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product", details: error },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();

    console.log("=== Product Update Request ===");
    console.log("Product ID:", id);
    console.log("Update data:", JSON.stringify(updateData, null, 2));

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // First check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", id)
      .single();

    if (checkError || !existingProduct) {
      console.error("Product not found:", id);
      return NextResponse.json(
        { error: "Product not found", productId: id },
        { status: 404 }
      );
    }

    console.log("Updating product:", existingProduct.name);

    // Update the product
    const { error: updateError } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update product", details: updateError },
        { status: 500 }
      );
    }

    // Fetch the updated product
    const { data: updatedProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !updatedProduct) {
      console.error("Error fetching updated product:", fetchError);
      // Product was updated but we couldn't fetch it, still return success
      return NextResponse.json({ 
        product: { id, ...updateData },
        warning: "Product updated but could not fetch latest data"
      }, { status: 200 });
    }

    console.log("Product updated successfully:", updatedProduct.name);
    return NextResponse.json({ product: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product", details: error },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
