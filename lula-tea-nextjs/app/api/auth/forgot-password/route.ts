import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { generateToken, generateTokenExpiry } from "@/lib/auth";
import { forgotPasswordSchema, formatZodErrors } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { generatePasswordResetEmail } from "@/lib/authEmailTemplates";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`forgot-password:${clientIp}`, {
      maxAttempts: 3,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many password reset attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          errors: formatZodErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find customer with this email
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    // Always return success to prevent email enumeration
    if (customerError || !customer) {
      return NextResponse.json(
        {
          success: true,
          message: "If an account with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetTokenExpiresAt = generateTokenExpiry();

    // Update customer with reset token
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        reset_token: resetToken,
        reset_token_expires_at: resetTokenExpiresAt.toISOString(),
      })
      .eq("id", customer.id);

    if (updateError) {
      console.error("Error updating reset token:", updateError);
      return NextResponse.json(
        {
          success: true,
          message: "If an account with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Send password reset email
    if (process.env.RESEND_API_KEY) {
      try {
        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || "https://lulatee.com"}/reset-password?token=${resetToken}`;
        const resetEmail = generatePasswordResetEmail(customer.name, resetLink, "en"); // TODO: Get language
        
        await resend.emails.send({
          from: "Lula Tea <orders@lulatee.com>",
          to: customer.email,
          subject: resetEmail.subject,
          html: resetEmail.html,
        });
      } catch (emailError) {
        console.error("Error sending password reset email:", emailError);
        // Don't fail - return success anyway
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
