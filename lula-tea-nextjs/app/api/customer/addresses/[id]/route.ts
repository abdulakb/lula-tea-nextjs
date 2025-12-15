import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { updateAddressSchema, formatZodErrors } from "@/lib/validations";

export async function PUT(
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
    const validation = updateAddressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          errors: formatZodErrors(validation.error)
        },
        { status: 400 }
      );
    }

    // Check if address belongs to customer
    const { data: existingAddress } = await supabase
      .from("customer_addresses")
      .select("id")
      .eq("id", id)
      .eq("customer_id", session.customerId)
      .single();

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (validation.data.addressType) updates.address_type = validation.data.addressType;
    if (validation.data.fullAddress) updates.full_address = validation.data.fullAddress;
    if (validation.data.gpsCoordinates !== undefined) updates.gps_coordinates = validation.data.gpsCoordinates;
    if (validation.data.city !== undefined) updates.city = validation.data.city;
    if (validation.data.isDefault !== undefined) {
      updates.is_default = validation.data.isDefault;
      
      // If setting as default, unset other defaults
      if (validation.data.isDefault) {
        await supabase
          .from("customer_addresses")
          .update({ is_default: false })
          .eq("customer_id", session.customerId)
          .neq("id", id);
      }
    }

    // Update address
    const { data: address, error: updateError } = await supabase
      .from("customer_addresses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating address:", updateError);
      return NextResponse.json(
        { error: "Failed to update address" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address updated successfully",
        address,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if address belongs to customer
    const { data: existingAddress } = await supabase
      .from("customer_addresses")
      .select("id")
      .eq("id", id)
      .eq("customer_id", session.customerId)
      .single();

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // Delete address
    const { error: deleteError } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting address:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete address" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Address deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
