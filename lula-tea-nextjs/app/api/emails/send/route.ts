import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured - email not sent");
      return NextResponse.json({
        success: false,
        message: "Email service not configured",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Use custom verified domain (subdomain from DNS records)
    const fromEmail = "Lula Tea <orders@send.lulatee.com>";

    const { data, error} = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
      replyTo: process.env.BUSINESS_EMAIL || undefined,
    });

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
