import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.customerId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get customer details from database
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, name, email, phone, email_verified, phone_verified, created_at")
      .eq("id", session.customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          emailVerified: customer.email_verified,
          phoneVerified: customer.phone_verified,
          createdAt: customer.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
