import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyEmailSchema, formatZodErrors } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = verifyEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          errors: formatZodErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // Find customer with this token
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    const tokenExpiry = new Date(customer.verification_token_expires_at);
    if (tokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Update customer to mark email as verified
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      })
      .eq("id", customer.id);

    if (updateError) {
      console.error("Error verifying email:", updateError);
      return NextResponse.json(
        { error: "Failed to verify email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! You can now log in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
