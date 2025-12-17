import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via WhatsApp or Email (no SMS to save costs)
async function sendOTPviaWhatsApp(phone: string, otp: string, customerEmail?: string): Promise<{ success: boolean; method: 'whatsapp' | 'email' }> {
  try {
    // Format phone number (ensure it has + prefix)
    const cleanPhone = phone.startsWith('+') ? phone : '+' + phone.replace(/\D/g, '');
    
    // Message in Arabic and English
    const message = `رمز التحقق الخاص بك / Your verification code: ${otp}\n\nصالح لمدة 10 دقائق / Valid for 10 minutes\n\nلولا تي Lula Tea`;
    
    // Try WhatsApp first
    try {
      await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${cleanPhone}`
      });
      console.log('✅ OTP sent via WhatsApp to:', cleanPhone);
      return { success: true, method: 'whatsapp' };
    } catch (whatsappError: any) {
      console.log('⚠️ WhatsApp failed, trying Email...', whatsappError.message);
      
      // Fallback to Email if customer has email
      if (customerEmail) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'Lula Tea <noreply@lulatee.com>',
          to: customerEmail,
          subject: 'رمز التحقق / Verification Code - Lula Tea',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2d5016; text-align: center;">🍵 Lula Tea</h2>
              <div style="background: #f5f5f5; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <p style="font-size: 18px; color: #666; margin-bottom: 10px;">رمز التحقق الخاص بك</p>
                <p style="font-size: 18px; color: #666; margin-bottom: 20px;">Your Verification Code</p>
                <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
                  <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2d5016;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #999; margin-top: 20px;">
                  صالح لمدة 10 دقائق / Valid for 10 minutes
                </p>
              </div>
              <p style="color: #999; font-size: 12px; text-align: center;">
                إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة
                <br>
                If you didn't request this code, please ignore this message
              </p>
            </div>
          `,
        });
        console.log('✅ OTP sent via Email to:', customerEmail);
        return { success: true, method: 'email' };
      }
      
      throw new Error('WhatsApp failed and no email available');
    }
  } catch (error: any) {
    console.error('❌ Error sending OTP:', error.message);
    return { success: false, method: 'whatsapp' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, action, otp } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');

    if (action === 'request-otp') {
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Check if customer exists to get email for fallback
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('email')
        .eq('phone', cleanPhone)
        .single();

      // Save OTP to database
      const { error } = await supabase
        .from('otp_verifications')
        .insert([
          {
            phone: cleanPhone,
            otp_code: otp,
            expires_at: expiresAt.toISOString(),
            verified: false,
            attempts: 0,
          },
        ]);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to generate OTP' },
          { status: 500 }
        );
      }

      // Send OTP via WhatsApp (with Email fallback)
      const result = await sendOTPviaWhatsApp(cleanPhone, otp, existingCustomer?.email);

      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to send OTP. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.method === 'email' 
          ? 'OTP sent to your email' 
          : 'OTP sent via WhatsApp',
        deliveryMethod: result.method,
        // In development, return OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp }),
      });
    }

    if (action === 'verify-otp') {
      if (!otp) {
        return NextResponse.json(
          { error: 'OTP is required' },
          { status: 400 }
        );
      }

      // Get latest OTP for this phone
      const { data: otpRecords, error: fetchError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError || !otpRecords || otpRecords.length === 0) {
        return NextResponse.json(
          { error: 'No OTP found. Please request a new one.' },
          { status: 404 }
        );
      }

      const otpRecord = otpRecords[0];

      // Check if expired
      if (new Date(otpRecord.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Check attempts
      if (otpRecord.attempts >= 3) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Please request a new OTP.' },
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
          { error: 'Invalid OTP. Please try again.' },
          { status: 400 }
        );
      }

      // Mark OTP as verified
      await supabase
        .from('otp_verifications')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', cleanPhone)
        .single();

      let customer;

      if (existingCustomer) {
        // Update verified status
        const { data: updatedCustomer } = await supabase
          .from('customers')
          .update({ verified: true, updated_at: new Date().toISOString() })
          .eq('phone', cleanPhone)
          .select()
          .single();
        
        customer = updatedCustomer;
      } else {
        // Create new customer
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert([
            {
              phone: cleanPhone,
              verified: true,
            },
          ])
          .select()
          .single();
        
        customer = newCustomer;
      }

      return NextResponse.json({
        success: true,
        message: 'Phone verified successfully',
        customer,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('OTP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
