import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      customerName,
      overallRating,
      tasteRating,
      qualityRating,
      deliveryRating,
      comments,
      language,
    } = await req.json();

    // Validation
    if (!overallRating || !tasteRating || !qualityRating || !deliveryRating) {
      return NextResponse.json(
        { error: "All ratings are required" },
        { status: 400 }
      );
    }

    if (
      overallRating < 1 ||
      overallRating > 5 ||
      tasteRating < 1 ||
      tasteRating > 5 ||
      qualityRating < 1 ||
      qualityRating > 5 ||
      deliveryRating < 1 ||
      deliveryRating > 5
    ) {
      return NextResponse.json(
        { error: "Ratings must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Insert review into database
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        order_id: orderId,
        customer_name: customerName,
        overall_rating: overallRating,
        taste_rating: tasteRating,
        quality_rating: qualityRating,
        delivery_rating: deliveryRating,
        comments: comments || null,
        language: language || 'ar',
        approved: false,
        featured: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting review:", error);
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review: data,
    });
  } catch (error) {
    console.error("Error in review submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
