import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: NextRequest) {
  try {
    console.log("=== Email Test Started ===");
    console.log("Environment variables check:");
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("RESEND_API_KEY value:", process.env.RESEND_API_KEY?.substring(0, 10) + "...");
    console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    console.log("BUSINESS_EMAIL:", process.env.BUSINESS_EMAIL);
    console.log("SITE_URL:", process.env.SITE_URL);

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "RESEND_API_KEY not configured",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Test email
    const { data, error } = await resend.emails.send({
      from: "Lula Tea <onboarding@resend.dev>",
      to: [process.env.ADMIN_EMAIL || "ak.bahareth@gmail.com"],
      subject: "Test Email from Lula Tea",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your Lula Tea website.</p>
        <p>If you receive this, your email configuration is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json({
        success: false,
        error: error.message || "Unknown error",
        details: error,
      });
    }

    console.log("Email sent successfully:", data);
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      data,
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to send test email",
      stack: error.stack,
    });
  }
}
