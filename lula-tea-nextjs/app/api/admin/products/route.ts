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

    if (error) throw error;

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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
