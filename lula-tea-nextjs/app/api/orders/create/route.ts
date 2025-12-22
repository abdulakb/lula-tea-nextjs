import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { generateInvoice, InvoiceData } from "@/lib/invoiceGenerator";
import { generateOrderConfirmationEmail } from "@/lib/emailTemplates";
import { generateAdminOrderNotification } from "@/lib/adminEmailTemplate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("=== Order Creation Started ===");
    console.log("Order data received:", {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      itemCount: body.items?.length,
      total: body.total
    });
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      deliveryNotes,
      deliveryTime,
      gpsCoordinates,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      transactionReference,
      language,
      qualifiesForFreeDelivery,
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      console.error("Validation failed:", { customerName: !!customerName, customerPhone: !!customerPhone, customerAddress: !!customerAddress, itemsLength: items?.length });
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
          ? "Cash on Delivery"
          : paymentMethod === "stripe"
          ? "Online Payment (Stripe)"
          : "WhatsApp Order",
      language,
    };

    let invoiceBlob;
    try {
      invoiceBlob = await generateInvoice(invoiceData);
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      // Continue without PDF - order is more important
    }

    // Convert blob to base64 for storage (or upload to storage service)
    let base64Invoice = null;
    if (invoiceBlob) {
      try {
        const buffer = await invoiceBlob.arrayBuffer();
        base64Invoice = Buffer.from(buffer).toString("base64");
      } catch (conversionError) {
        console.error("Base64 conversion error:", conversionError);
      }
    }

    // Calculate total quantity ordered
    const quantityOrdered = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

    console.log("Saving order to database...", { orderId, quantityOrdered });

    // Deduct stock for each item
    const stockDeductionResults = [];
    for (const item of items) {
      try {
        // Call the deduct_product_stock function
        const { data: stockResult, error: stockError } = await supabase
          .rpc('deduct_product_stock', {
            p_product_id: item.id,
            p_quantity: item.quantity,
            p_order_id: orderId
          });

        if (stockError) {
          console.error(`Stock deduction error for item ${item.id}:`, stockError);
          stockDeductionResults.push({ 
            item: item.name, 
            success: false, 
            error: stockError.message 
          });
        } else if (!stockResult.success) {
          console.error(`Insufficient stock for item ${item.name}:`, stockResult);
          // Rollback: we should not continue if stock is insufficient
          return NextResponse.json({
            error: `Insufficient stock for ${item.name}. Available: ${stockResult.available}, Requested: ${stockResult.requested}`,
            insufficientStock: true,
            item: item.name
          }, { status: 400 });
        } else {
          console.log(`Stock deducted successfully for ${item.name}:`, stockResult);
          stockDeductionResults.push({ 
            item: item.name, 
            success: true, 
            ...stockResult 
          });
          
          // Check for low stock alert
          if (stockResult.low_stock_alert) {
            console.warn(`⚠️ LOW STOCK ALERT: ${item.name} - Current stock: ${stockResult.new_stock}`);
            // You could send notification here
          }
        }
      } catch (err) {
        console.error(`Error deducting stock for ${item.name}:`, err);
        stockDeductionResults.push({ 
          item: item.name, 
          success: false, 
          error: String(err) 
        });
      }
    }

    console.log("Stock deduction results:", stockDeductionResults);


    // Check if customer is logged in
    let customerId = null;
    if (customerPhone) {
      // Sanitize phone to match format in database
      const sanitizedPhone = customerPhone.startsWith('+') 
        ? customerPhone 
        : customerPhone.startsWith('966') 
        ? '+' + customerPhone 
        : customerPhone.startsWith('0') 
        ? '+966' + customerPhone.slice(1)
        : '+966' + customerPhone;
      
      // Try to find customer by phone
      const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', sanitizedPhone)
        .eq('verified', true)
        .single();
      
      if (customerData) {
        customerId = customerData.id;
        console.log('Order linked to customer:', customerId);
      }
    }

    // Save order to Supabase with all customer form data
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_id: orderId,
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail || null,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          building_number: body.buildingNumber || null,
          delivery_address_formatted: customerAddress,
          gps_coordinates: gpsCoordinates || null,
          delivery_time_preference: deliveryTime || null,
          delivery_notes: deliveryNotes || null,
          transaction_reference: transactionReference || null,
          quantity_ordered: quantityOrdered,
          items: JSON.stringify(items),
          subtotal,
          delivery_fee: deliveryFee || 0,
          total,
          payment_method: paymentMethod,
          invoice_base64: base64Invoice,
          status: "pending",
          order_date: new Date().toISOString(),
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
    
    console.log("Order saved to database successfully:", orderData?.[0]?.id);

    // Send confirmation email (if configured)
    console.log("Checking email configuration...", { 
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      customerEmail: customerEmail || "not provided"
    });
    
    try {
      if (process.env.RESEND_API_KEY) {
        // Send customer confirmation email
        if (customerEmail) {
          console.log("Sending customer confirmation email to:", customerEmail);
          const { subject, html } = generateOrderConfirmationEmail({
            orderId,
            customerName,
            items,
            total,
            paymentMethod,
            language,
          });

          const customerEmailResponse = await fetch(`${process.env.SITE_URL || 'http://localhost:3000'}/api/emails/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: customerEmail,
              subject,
              html,
            }),
          });
          
          const customerEmailResult = await customerEmailResponse.json();
          console.log("Customer email result:", customerEmailResult);
        } else {
          console.log("No customer email provided, skipping customer notification");
        }

        // Send admin notification email
        if (process.env.ADMIN_EMAIL) {
          console.log("Sending admin notification to:", process.env.ADMIN_EMAIL);
          const adminNotification = generateAdminOrderNotification({
            orderId,
            customerName,
            customerEmail: customerEmail || null,
            customerPhone,
            deliveryAddress: customerAddress,
            deliveryTime,
            gpsCoordinates,
            items,
            subtotal,
            deliveryFee: deliveryFee || 0,
            total,
            paymentMethod,
            qualifiesForFreeDelivery: qualifiesForFreeDelivery || false,
          });

          const adminEmailResponse = await fetch(`${process.env.SITE_URL || 'http://localhost:3000'}/api/emails/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: process.env.ADMIN_EMAIL,
              subject: adminNotification.subject,
              html: adminNotification.html,
            }),
          });
          
          const adminEmailResult = await adminEmailResponse.json();
          console.log("Admin email result:", adminEmailResult);
        } else {
          console.log("No admin email configured, skipping admin notification");
        }
      } else {
        console.log("RESEND_API_KEY not configured, skipping email notifications");
      }
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Don't fail the order if email fails
    }

    // Send WhatsApp notification to admin about new order
    try {
      // Create Google Maps link from address
      const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`;
      
      // Build address line with building number if provided
      const fullAddress = body.buildingNumber 
        ? `${customerAddress} (${language === "ar" ? "مبنى" : "Building"} ${body.buildingNumber})`
        : customerAddress;
      
      // Only include amount for COD orders
      const amountLine = paymentMethod === "cod" 
        ? (language === "ar" 
          ? `\n💰 المبلغ المطلوب: ${total} ريال (الدفع عند الاستلام)`
          : `\n💰 Amount to Collect: ${total} SAR (Cash on Delivery)`)
        : "";
      
      const adminWhatsappMessage = language === "ar"
        ? `🔔 *طلب جديد!*\n\n📋 رقم الطلب: ${orderId}\n👤 العميل: ${customerName}\n📞 الهاتف: ${customerPhone}\n📍 العنوان: ${fullAddress}\n🗺️ خرائط جوجل: ${googleMapsLink}${amountLine}\n⏰ وقت التوصيل: ${deliveryTime || "في أقرب وقت"}\n\n🛒 المنتجات:\n${items.map((item: any) => `• ${item.nameAr || item.name} × ${item.quantity}`).join('\n')}\n\nعرض التفاصيل: ${process.env.SITE_URL || 'https://lulatee.com'}/admin/orders/${orderData?.[0]?.id}`
        : `🔔 *New Order!*\n\n📋 Order: ${orderId}\n👤 Customer: ${customerName}\n📞 Phone: ${customerPhone}\n📍 Address: ${fullAddress}\n🗺️ Google Maps: ${googleMapsLink}${amountLine}\n⏰ Delivery Time: ${deliveryTime || "ASAP"}\n\n🛒 Items:\n${items.map((item: any) => `• ${item.name} × ${item.quantity}`).join('\n')}\n\nView details: ${process.env.SITE_URL || 'https://lulatee.com'}/admin/orders/${orderData?.[0]?.id}`;

      console.log("Sending admin WhatsApp notification for order:", orderId);
      
      // Send WhatsApp notification to admin
      const whatsappResponse = await fetch(`${process.env.SITE_URL || 'https://lulatee.com'}/api/notifications/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966539666654",
          message: adminWhatsappMessage
        })
      });

      const whatsappResult = await whatsappResponse.json();
      console.log("WhatsApp notification result:", whatsappResult);
      
      if (whatsappResult.success && whatsappResult.whatsappUrl) {
        console.log("✅ WhatsApp notification link generated:", whatsappResult.whatsappUrl);
      }
    } catch (adminWhatsappError) {
      console.error("Admin WhatsApp notification error:", adminWhatsappError);
      // Don't fail the order if admin notification fails
    }

    console.log("=== Order Creation Completed Successfully ===", { orderId, hasInvoice: !!base64Invoice });

    // Prepare WhatsApp links for customer invoice
    let customerInvoiceWhatsappUrl = null;
    try {
      const siteUrl = process.env.SITE_URL || 'https://lulatee.com';
      const invoiceUrl = `${siteUrl}/api/invoice/${orderId}`;
      const whatsappMessage = language === "ar"
        ? `✅ تم تأكيد طلبك من لولا تي!\n\nرقم الطلب: ${orderId}\nالإجمالي: ${total} ريال\n\nتحميل الفاتورة:\n${invoiceUrl}\n\nشكراً لطلبك! 🍵\n\n💚 لولة تي - مصنوع بحب`
        : `✅ Order Confirmed - Lula Tea!\n\nOrder ID: ${orderId}\nTotal: ${total} SAR\n\nDownload Invoice:\n${invoiceUrl}\n\nThank you for your order! 🍵\n\n💚 Lula Tea - Homemade with Love`;
      
      // Clean phone and add Saudi country code
      let cleanPhone = customerPhone.replace(/\D/g, '');
      if (!cleanPhone.startsWith('966')) {
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '966' + cleanPhone.substring(1);
        } else {
          cleanPhone = '966' + cleanPhone;
        }
      }
      
      customerInvoiceWhatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
      console.log("✅ Customer WhatsApp invoice link generated:", customerInvoiceWhatsappUrl);
    } catch (e) {
      console.error("Error creating customer WhatsApp URL:", e);
    }

    return NextResponse.json({
      success: true,
      orderId,
      invoiceBase64: base64Invoice,
      orderData: orderData?.[0],
      customerInvoiceWhatsappUrl, // Return this to frontend to auto-open
    });
  } catch (error) {
    console.error("=== Order Creation Failed ===");
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
