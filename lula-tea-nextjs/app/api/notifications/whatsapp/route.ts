import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required" },
        { status: 400 }
      );
    }

    // Format phone number (remove non-digits)
    const formattedPhone = phoneNumber.replace(/\D/g, "");
    
    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // For now, we return the URL. In production with WhatsApp Business API,
    // you would send the message directly via API
    return NextResponse.json({
      success: true,
      whatsappUrl,
      message: "WhatsApp notification URL generated",
    });
  } catch (error: any) {
    console.error("WhatsApp notification error:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp notification", details: error.message },
      { status: 500 }
    );
  }
}
