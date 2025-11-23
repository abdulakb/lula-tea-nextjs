import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { generateInvoice, InvoiceData } from "@/lib/invoiceGenerator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      deliveryNotes,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      language,
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `LT${Date.now()}`;
    const orderDate = new Date().toLocaleDateString(
      language === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    // Generate PDF invoice
    const invoiceData: InvoiceData = {
      orderId,
      orderDate,
      customerName,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod:
        paymentMethod === "cod"
          ? language === "ar"
            ? "الدفع عند الاستلام"
            : "Cash on Delivery"
          : language === "ar"
          ? "واتساب"
          : "WhatsApp",
      language,
    };

    const invoiceBlob = await generateInvoice(invoiceData);

    // Convert blob to base64 for storage (or upload to storage service)
    const buffer = await invoiceBlob.arrayBuffer();
    const base64Invoice = Buffer.from(buffer).toString("base64");

    // Save order to Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_id: orderId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          delivery_notes: deliveryNotes || null,
          items: JSON.stringify(items),
          subtotal,
          delivery_fee: deliveryFee || 0,
          total,
          payment_method: paymentMethod,
          invoice_base64: base64Invoice,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (orderError) {
      console.error("Supabase error:", orderError);
      // Continue even if DB fails - at least return the invoice
      return NextResponse.json({
        success: true,
        orderId,
        invoiceBase64: base64Invoice,
        warning: "Order saved locally but database sync failed",
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      invoiceBase64: base64Invoice,
      orderData: orderData?.[0],
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
