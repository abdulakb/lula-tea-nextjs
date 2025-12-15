import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { action, email, token, newPassword } = await request.json();

    if (action === "request-reset") {
      // Validate email
      if (!email) {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      // Find customer by email
      const { data: customer } = await supabase
        .from("customers")
        .select("id, email, name")
        .eq("email", email.toLowerCase())
        .single();

      // Always return success (don't reveal if email exists)
      if (!customer) {
        return NextResponse.json({
          success: true,
          message: "If an account exists with this email, a reset link has been sent",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      // Save reset token
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          reset_token: resetToken,
          reset_token_expires: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id);

      if (updateError) {
        console.error("Error saving reset token:", updateError);
        return NextResponse.json(
          { error: "Failed to process request" },
          { status: 500 }
        );
      }

      // Send reset email
      try {
        const resetUrl = `${process.env.SITE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
        
        // TODO: Implement email sending with Resend
        // For now, log the reset URL in development
        if (process.env.NODE_ENV !== "production") {
          console.log("Password Reset URL:", resetUrl);
        }

        // In production, send email:
        // await sendPasswordResetEmail(customer.email, customer.name, resetUrl);
      } catch (emailError) {
        console.error("Error sending reset email:", emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a reset link has been sent",
        ...(process.env.NODE_ENV !== "production" && { 
          devResetToken: resetToken 
        }),
      });
    }

    if (action === "reset-password") {
      // Validate input
      if (!token || !newPassword) {
        return NextResponse.json(
          { error: "Token and new password are required" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }

      // Find customer by reset token
      const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("reset_token", token)
        .single();

      if (!customer) {
        return NextResponse.json(
          { error: "Invalid or expired reset token" },
          { status: 400 }
        );
      }

      // Check if token expired
      const tokenExpiry = new Date(customer.reset_token_expires);
      if (tokenExpiry < new Date()) {
        return NextResponse.json(
          { error: "Reset token has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          password_hash: passwordHash,
          reset_token: null,
          reset_token_expires: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id);

      if (updateError) {
        console.error("Error updating password:", updateError);
        return NextResponse.json(
          { error: "Failed to reset password" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Password reset successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
