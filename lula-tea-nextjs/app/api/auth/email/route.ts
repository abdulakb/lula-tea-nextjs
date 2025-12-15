import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json();

    if (action === "signup") {
      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }

      // Check if email already exists
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id, email")
        .eq("email", email.toLowerCase())
        .single();

      if (existingCustomer) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create customer account
      const { data: customer, error: createError } = await supabase
        .from("customers")
        .insert([
          {
            email: email.toLowerCase(),
            password_hash: passwordHash,
            name: name || null,
            verified: false, // Will verify via email
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating customer:", createError);
        return NextResponse.json(
          { error: "Failed to create account" },
          { status: 500 }
        );
      }

      // TODO: Send verification email
      // For now, auto-verify in development
      if (process.env.NODE_ENV !== "production") {
        await supabase
          .from("customers")
          .update({ verified: true, email_verified: true })
          .eq("id", customer.id);
        
        customer.verified = true;
        customer.email_verified = true;
      }

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          verified: customer.verified,
          email_verified: customer.email_verified,
        },
      });
    }

    if (action === "login") {
      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      // Find customer by email
      const { data: customer, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("email", email.toLowerCase())
        .single();

      if (fetchError || !customer) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Check if password exists
      if (!customer.password_hash) {
        return NextResponse.json(
          { error: "This account uses phone authentication. Please login with your phone number." },
          { status: 400 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        customer.password_hash
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Return customer data (without password hash)
      const { password_hash, reset_token, reset_token_expires, ...safeCustomer } = customer;

      return NextResponse.json({
        success: true,
        message: "Login successful",
        customer: safeCustomer,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Email auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
