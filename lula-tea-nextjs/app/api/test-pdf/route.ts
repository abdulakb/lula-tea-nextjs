import { NextRequest, NextResponse } from "next/server";
import { generateInvoice } from "@/lib/invoiceGenerator";

export async function GET(request: NextRequest) {
  try {
    // Test invoice data
    const testData = {
      orderId: "TEST123",
      orderDate: new Date().toLocaleDateString("en-US"),
      customerName: "Test Customer",
      customerPhone: "+966 50 000 0000",
      customerAddress: "Test Address, Riyadh, Saudi Arabia",
      items: [
        {
          name: "Butterfly Pea Tea",
          nameAr: "شاي البازلاء الفراشية",
          quantity: 2,
          price: 25,
        },
      ],
      subtotal: 50,
      deliveryFee: 15,
      total: 65,
      paymentMethod: "Cash on Delivery",
      language: "en" as const,
    };

    // Generate PDF
    console.log("Generating test PDF...");
    const pdfBlob = await generateInvoice(testData);
    console.log("PDF blob size:", pdfBlob.size, "bytes");

    // Convert to base64
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    console.log("Base64 length:", base64.length);

    // Convert back to blob
    const decodedBuffer = Buffer.from(base64, "base64");
    console.log("Decoded buffer size:", decodedBuffer.length, "bytes");

    // Return the PDF directly
    return new NextResponse(decodedBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="test-invoice.pdf"',
      },
    });
  } catch (error) {
    console.error("Test PDF error:", error);
    return NextResponse.json(
      { error: "PDF generation failed", details: String(error) },
      { status: 500 }
    );
  }
}
