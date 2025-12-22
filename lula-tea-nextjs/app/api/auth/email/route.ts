import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name, otp } = await request.json();

    if (action === "signup") {
      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }

      if (!isValidEmail(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
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

      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create customer account (unverified)
      const { data: customer, error: createError } = await supabase
        .from("customers")
        .insert([
          {
            email: email.toLowerCase(),
            password_hash: passwordHash,
            name: name || null,
            verified: false,
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

      // Save OTP to database
      const { error: otpError } = await supabase
        .from("otp_verifications")
        .insert([
          {
            phone: email.toLowerCase(), // Use email field for email OTPs
            otp_code: otpCode,
            expires_at: expiresAt.toISOString(),
            verified: false,
            attempts: 0,
          },
        ]);

      if (otpError) {
        console.error("Error saving OTP:", otpError);
      }

      // Send verification email
      try {
        await resend.emails.send({
          from: 'Lula Tea <noreply@lulatee.com>',
          to: email,
          subject: 'رمز التحقق / Email Verification - Lula Tea',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2d5016; text-align: center;">🍵 Lula Tea</h2>
              <h3 style="text-align: center;">مرحباً بك / Welcome!</h3>
              <div style="background: #f5f5f5; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <p style="font-size: 18px; color: #666; margin-bottom: 10px;">رمز التحقق الخاص بك</p>
                <p style="font-size: 18px; color: #666; margin-bottom: 20px;">Your Verification Code</p>
                <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
                  <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2d5016;">${otpCode}</span>
                </div>
                <p style="font-size: 14px; color: #999; margin-top: 20px;">
                  صالح لمدة 10 دقائق / Valid for 10 minutes
                </p>
              </div>
              <p style="color: #666; text-align: center;">
                أدخل هذا الرمز لتفعيل حسابك
                <br>
                Enter this code to activate your account
              </p>
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                إذا لم تقم بإنشاء حساب، يرجى تجاهل هذه الرسالة
                <br>
                If you didn't create an account, please ignore this message
              </p>
            </div>
          `,
        });
        console.log('✅ Verification email sent to:', email);
      } catch (emailError) {
        console.error('❌ Error sending verification email:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email",
        requiresVerification: true,
        email: email.toLowerCase(),
        // In development, return OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp: otpCode }),
      });
    }

    if (action === "verify-email") {
      // Verify email OTP
      if (!email || !otp) {
        return NextResponse.json(
          { error: "Email and OTP are required" },
          { status: 400 }
        );
      }

      // Get latest OTP for this email
      const { data: otpRecords, error: fetchError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', email.toLowerCase()) // Using phone field for email
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError || !otpRecords || otpRecords.length === 0) {
        return NextResponse.json(
          { error: 'No verification code found. Please request a new one.' },
          { status: 404 }
        );
      }

      const otpRecord = otpRecords[0];

      // Check if expired
      if (new Date(otpRecord.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Check attempts
      if (otpRecord.attempts >= 3) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Please request a new code.' },
          { status: 400 }
        );
      }

      // Verify OTP
      if (otpRecord.otp_code !== otp) {
        // Increment attempts
        await supabase
          .from('otp_verifications')
          .update({ attempts: otpRecord.attempts + 1 })
          .eq('id', otpRecord.id);

        return NextResponse.json(
          { error: 'Invalid verification code. Please try again.' },
          { status: 400 }
        );
      }

      // Mark OTP as verified
      await supabase
        .from('otp_verifications')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      // Update customer as verified
      const { data: customer, error: updateError } = await supabase
        .from('customers')
        .update({ 
          verified: true, 
          email_verified: true,
          updated_at: new Date().toISOString() 
        })
        .eq('email', email.toLowerCase())
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to verify account' },
          { status: 500 }
        );
      }

      // Return customer data (without password hash)
      const { password_hash, reset_token, reset_token_expires, ...safeCustomer } = customer;

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        customer: safeCustomer,
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

      if (!isValidEmail(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
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

      // Check if email is verified
      if (!customer.email_verified) {
        return NextResponse.json(
          { error: "Please verify your email first. Check your inbox for the verification code." },
          { status: 403 }
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
