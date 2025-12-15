import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { addressSchema, formatZodErrors } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.customerId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get customer addresses
    const { data: addresses, error: addressesError } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", session.customerId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (addressesError) {
      console.error("Error fetching addresses:", addressesError);
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        addresses: addresses || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.customerId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = addressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          errors: formatZodErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const { addressType, fullAddress, gpsCoordinates, city, isDefault } = validation.data;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", session.customerId);
    }

    // Create address
    const { data: address, error: addressError } = await supabase
      .from("customer_addresses")
      .insert([
        {
          customer_id: session.customerId,
          address_type: addressType,
          full_address: fullAddress,
          gps_coordinates: gpsCoordinates,
          city: city,
          is_default: isDefault,
        },
      ])
      .select()
      .single();

    if (addressError) {
      console.error("Error creating address:", addressError);
      return NextResponse.json(
        { error: "Failed to create address" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully",
        address,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
