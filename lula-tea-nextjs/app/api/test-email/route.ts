import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: NextRequest) {
  try {
    console.log("=== Email Test Started ===");
    
    // Check all environment variables
    const envCheck = {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 
        `EXISTS (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : 
        "MISSING",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || "MISSING",
      BUSINESS_EMAIL: process.env.BUSINESS_EMAIL || "MISSING",
      SITE_URL: process.env.SITE_URL || "MISSING",
      NODE_ENV: process.env.NODE_ENV,
    };
    
    console.log("Environment variables:", envCheck);

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "RESEND_API_KEY not configured",
        envCheck,
        hint: "Add RESEND_API_KEY to Vercel environment variables and redeploy"
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Force use lula.tea@outlook.com (lowercase) since Resend free tier only allows this
    const testEmail = "lula.tea@outlook.com";
    
    console.log("Sending test email to:", testEmail);
    console.log("ADMIN_EMAIL env var:", process.env.ADMIN_EMAIL);

    // Test email
    const { data, error } = await resend.emails.send({
      from: "Lula Tea <orders@send.lulatee.com>",
      to: [testEmail],
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
