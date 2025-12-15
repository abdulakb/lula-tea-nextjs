import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { hashPassword, generateToken, generateTokenExpiry, formatPhoneNumber, sanitizeInput } from "@/lib/auth";
import { signupSchema, formatZodErrors } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { generateWelcomeEmail, generateVerificationEmail } from "@/lib/authEmailTemplates";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`signup:${clientIp}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many signup attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          errors: formatZodErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = validation.data;
    
    // Get language preference from request body or headers
    const language = (body.language as "en" | "ar") || 
      (request.headers.get("accept-language")?.includes("ar") ? "ar" : "en");

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email ? sanitizeInput(email.toLowerCase()) : null;
    const formattedPhone = phone ? formatPhoneNumber(phone) : null;

    // Check if customer already exists
    let existingCustomer = null;
    
    if (sanitizedEmail) {
      const { data } = await supabase
        .from("customers")
        .select("id, email, phone")
        .eq("email", sanitizedEmail)
        .single();
      existingCustomer = data;
    }

    if (!existingCustomer && formattedPhone) {
      const { data } = await supabase
        .from("customers")
        .select("id, email, phone")
        .eq("phone", formattedPhone)
        .single();
      existingCustomer = data;
    }

    if (existingCustomer) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateToken();
    const verificationTokenExpiresAt = generateTokenExpiry();

    // Create customer
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert([
        {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: formattedPhone,
          password_hash: passwordHash,
          email_verified: false,
          phone_verified: false,
          verification_token: verificationToken,
          verification_token_expires_at: verificationTokenExpiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (customerError) {
      console.error("Error creating customer:", customerError);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Send welcome email (if email provided)
    if (sanitizedEmail && process.env.RESEND_API_KEY) {
      try {
        const welcomeEmail = generateWelcomeEmail(sanitizedName, language);
        await resend.emails.send({
          from: "Lula Tea <orders@lulatee.com>",
          to: sanitizedEmail,
          subject: welcomeEmail.subject,
          html: welcomeEmail.html,
        });
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Continue anyway - don't fail signup because of email
      }

      // Send verification email
      try {
        const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || "https://lulatee.com"}/verify-email?token=${verificationToken}`;
        const verificationEmail = generateVerificationEmail(sanitizedName, verificationLink, language);
        await resend.emails.send({
          from: "Lula Tea <orders@lulatee.com>",
          to: sanitizedEmail,
          subject: verificationEmail.subject,
          html: verificationEmail.html,
        });
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Continue anyway
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: sanitizedEmail
          ? "Account created successfully! Please check your email to verify your account."
          : "Account created successfully! You can now log in.",
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
