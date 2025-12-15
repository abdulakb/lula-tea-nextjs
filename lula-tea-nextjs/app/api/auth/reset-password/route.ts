import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema, formatZodErrors } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          errors: formatZodErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Find customer with this reset token
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("reset_token", token)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    const tokenExpiry = new Date(customer.reset_token_expires_at);
    if (tokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update customer password and clear reset token
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires_at: null,
      })
      .eq("id", customer.id);

    if (updateError) {
      console.error("Error resetting password:", updateError);
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully! You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
