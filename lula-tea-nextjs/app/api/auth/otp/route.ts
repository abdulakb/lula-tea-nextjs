import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via WhatsApp (using your existing WhatsApp integration)
async function sendOTPviaWhatsApp(phone: string, otp: string): Promise<boolean> {
  try {
    // Format phone number (remove any spaces, dashes)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Message in Arabic and English
    const message = `رمز التحقق الخاص بك / Your verification code: ${otp}\n\nصالح لمدة 10 دقائق / Valid for 10 minutes\n\nلولا تي Lula Tea`;
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // In production, you would use WhatsApp Business API to send automatically
    // For now, this returns the URL that can be opened
    console.log('WhatsApp OTP URL:', whatsappUrl);
    
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
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

      // Send OTP
      await sendOTPviaWhatsApp(cleanPhone, otp);

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
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
