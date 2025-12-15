import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { updateProfileSchema, formatZodErrors } from "@/lib/validations";
import { sanitizeInput, formatPhoneNumber } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.customerId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get customer profile
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, name, email, phone, email_verified, phone_verified, created_at, updated_at")
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
        profile: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          emailVerified: customer.email_verified,
          phoneVerified: customer.phone_verified,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          errors: formatZodErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const updates: any = {};

    if (validation.data.name) {
      updates.name = sanitizeInput(validation.data.name);
    }

    if (validation.data.email) {
      const sanitizedEmail = sanitizeInput(validation.data.email.toLowerCase());
      
      // Check if email is already taken by another customer
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", sanitizedEmail)
        .neq("id", session.customerId)
        .single();

      if (existingCustomer) {
        return NextResponse.json(
          { error: "This email is already taken" },
          { status: 409 }
        );
      }

      updates.email = sanitizedEmail;
      updates.email_verified = false; // Need to re-verify new email
    }

    if (validation.data.phone) {
      const formattedPhone = formatPhoneNumber(validation.data.phone);
      
      // Check if phone is already taken by another customer
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", formattedPhone)
        .neq("id", session.customerId)
        .single();

      if (existingCustomer) {
        return NextResponse.json(
          { error: "This phone number is already taken" },
          { status: 409 }
        );
      }

      updates.phone = formattedPhone;
      updates.phone_verified = false; // Need to re-verify new phone
    }

    // Update customer profile
    const { data: customer, error: updateError } = await supabase
      .from("customers")
      .update(updates)
      .eq("id", session.customerId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        profile: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          emailVerified: customer.email_verified,
          phoneVerified: customer.phone_verified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
