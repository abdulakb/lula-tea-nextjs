import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyPassword, formatPhoneNumber, isValidEmail } from "@/lib/auth";
import { loginSchema, formatZodErrors } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`login:${clientIp}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          errors: formatZodErrors(validation.error)
        },
        { status: 400 }
      );
    }

    const { identifier, password } = validation.data;

    // Determine if identifier is email or phone
    const isEmail = isValidEmail(identifier);
    let query = supabase
      .from("customers")
      .select("*");

    if (isEmail) {
      query = query.eq("email", identifier.toLowerCase());
    } else {
      const formattedPhone = formatPhoneNumber(identifier);
      query = query.eq("phone", formattedPhone);
    }

    const { data: customer, error: customerError } = await query.single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, customer.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    // Create session
    await createSession({
      id: customer.id,
      email: customer.email,
      phone: customer.phone,
      name: customer.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        customer: {
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
