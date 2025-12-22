import { NextResponse } from "next/server";
import twilio from "twilio";

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required" },
        { status: 400 }
      );
    }

    // Format phone number (ensure it has country code)
    let formattedPhone = phoneNumber.replace(/\D/g, "");
    if (!formattedPhone.startsWith('966')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '966' + formattedPhone.substring(1);
      } else {
        formattedPhone = '966' + formattedPhone;
      }
    }
    formattedPhone = '+' + formattedPhone;
    
    // Encode message for WhatsApp URL (fallback)
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodedMessage}`;

    // Try to send via Twilio WhatsApp
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER) {
      try {
        console.log("\n=== Sending WhatsApp via Twilio ===");
        console.log("To:", formattedPhone);
        console.log("From:", process.env.TWILIO_WHATSAPP_NUMBER);
        console.log("Message preview:", message.substring(0, 100) + "...");
        
        const twilioMessage = await twilioClient.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: `whatsapp:${formattedPhone}`,
          body: message,
        });

        console.log("✅ WhatsApp sent via Twilio!");
        console.log("Message SID:", twilioMessage.sid);
        console.log("Status:", twilioMessage.status);
        
        return NextResponse.json({
          success: true,
          whatsappUrl,
          twilioSid: twilioMessage.sid,
          message: "WhatsApp notification sent via Twilio",
        });
      } catch (twilioError: any) {
        console.error("\n❌ Twilio WhatsApp error:");
        console.error("Error code:", twilioError.code);
        console.error("Error message:", twilioError.message);
        console.error("More info:", twilioError.moreInfo);
        
        // Log full message for manual sending
        console.log("\n📋 Message that would have been sent:");
        console.log("─────────────────────────────────────");
        console.log(message);
        console.log("─────────────────────────────────────\n");
        
        // Return URL as fallback
        return NextResponse.json({
          success: true,
          whatsappUrl,
          message: "WhatsApp URL generated (Twilio failed - check console for message)",
          error: twilioError.message,
        });
      }
    }

    // Fallback: return URL only
    return NextResponse.json({
      success: true,
      whatsappUrl,
      message: "WhatsApp notification URL generated (Twilio not configured)",
    });
  } catch (error: any) {
    console.error("WhatsApp notification error:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp notification", details: error.message },
      { status: 500 }
    );
  }
}
