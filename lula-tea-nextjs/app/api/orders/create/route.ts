import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { generateInvoice, InvoiceData } from "@/lib/invoiceGenerator";
import { generateOrderConfirmationEmail } from "@/lib/emailTemplates";
import { generateAdminOrderNotification } from "@/lib/adminEmailTemplate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("=== Order Creation Started ===");
    console.log("Using supabaseAdmin:", !!supabaseAdmin);
    console.log("Has service role key:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
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
      deliveryCity,
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      console.error("Validation failed:", { customerName: !!customerName, customerPhone: !!customerPhone, customerAddress: !!customerAddress, itemsLength: items?.length });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate delivery city - only Riyadh and Jeddah allowed
    if (gpsCoordinates) {
      // Extract city from GPS coordinates if provided
      const coords = gpsCoordinates.split(',');
      if (coords.length === 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        
        // Riyadh boundaries
        const isRiyadh = lat >= 24.4 && lat <= 25.0 && lng >= 46.3 && lng <= 47.0;
        // Jeddah boundaries
        const isJeddah = lat >= 21.3 && lat <= 21.8 && lng >= 39.0 && lng <= 39.4;
        
        if (!isRiyadh && !isJeddah) {
          console.error("Order rejected: Location outside Riyadh/Jeddah", { lat, lng });
          return NextResponse.json(
            { 
              error: language === "ar" 
                ? "عذراً، نوصل حالياً فقط في الرياض وجدة"
                : "Sorry, we currently deliver only in Riyadh and Jeddah",
              invalidLocation: true 
            },
            { status: 403 }
          );
        }
      }
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

    // Determine delivery city from GPS coordinates or use provided city
    let orderCity = deliveryCity;
    if (!orderCity && gpsCoordinates) {
      const coords = gpsCoordinates.split(',');
      if (coords.length === 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        
        // Riyadh boundaries
        const isRiyadh = lat >= 24.4 && lat <= 25.0 && lng >= 46.3 && lng <= 47.0;
        // Jeddah boundaries
        const isJeddah = lat >= 21.3 && lat <= 21.8 && lng >= 39.0 && lng <= 39.4;
        
        orderCity = isRiyadh ? 'Riyadh' : isJeddah ? 'Jeddah' : null;
      }
    }

    // Validate city before stock deduction
    if (!orderCity || (orderCity !== 'Riyadh' && orderCity !== 'Jeddah')) {
      return NextResponse.json({
        error: language === "ar" 
          ? "عذراً، يجب تحديد مدينة التوصيل (الرياض أو جدة)"
          : "Sorry, delivery city must be Riyadh or Jeddah",
        invalidCity: true
      }, { status: 400 });
    }

    // Deduct stock for each item from city-specific inventory
    const stockDeductionResults = [];
    for (const item of items) {
      try {
        // Call the city-specific deduct_city_product_stock function
        const { data: stockResult, error: stockError } = await supabaseAdmin
          .rpc('deduct_city_product_stock', {
            p_product_id: item.id,
            p_quantity: item.quantity,
            p_order_id: orderId,
            p_city: orderCity
          });

        if (stockError) {
          console.error(`Stock deduction error for item ${item.id} in ${orderCity}:`, stockError);
          stockDeductionResults.push({ 
            item: item.name, 
            success: false, 
            error: stockError.message 
          });
        } else if (!stockResult.success) {
          console.error(`Insufficient stock for item ${item.name} in ${orderCity}:`, stockResult);
          // Rollback: we should not continue if stock is insufficient
          return NextResponse.json({
            error: `Insufficient stock for ${item.name} in ${orderCity}. Available: ${stockResult.available}, Requested: ${stockResult.requested}`,
            insufficientStock: true,
            item: item.name,
            city: orderCity
          }, { status: 400 });
        } else {
          console.log(`Stock deducted successfully for ${item.name} in ${orderCity}:`, stockResult);
          stockDeductionResults.push({ 
            item: item.name, 
            success: true,
            city: orderCity,
            ...stockResult 
          });
          
          // Check for low stock alert
          if (stockResult.new_stock <= 5) {
            console.warn(`⚠️ LOW STOCK ALERT in ${orderCity}: ${item.name} - Current stock: ${stockResult.new_stock}`);
            // You could send notification here
          }
        }
      } catch (err) {
        console.error(`Error deducting stock for ${item.name} in ${orderCity}:`, err);
        stockDeductionResults.push({ 
          item: item.name,
          city: orderCity,
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
      const { data: customerData } = await supabaseAdmin
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
    const { data: orderData, error: orderError } = await supabaseAdmin
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
          delivery_city: orderCity, // Add city to order
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
      console.error("❌ DATABASE INSERT FAILED:", orderError);
      console.error("Order details:", { orderId, customerName, customerPhone, total });
      
      // CRITICAL: Order must be saved to database
      return NextResponse.json({
        success: false,
        error: "Failed to save order. Please try again or contact support.",
        details: orderError.message,
      }, { status: 500 });
    }
    
    if (!orderData || orderData.length === 0) {
      console.error("❌ Order saved but no data returned");
      return NextResponse.json({
        success: false,
        error: "Order creation failed - no data returned"
      }, { status: 500 });
    }
    
    console.log("✅ Order saved to database successfully:", orderData[0].id);

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
            propertyType: body.propertyType,
            villaNumber: body.villaNumber,
            buildingNumber: body.buildingNumber,
            floorNumber: body.floorNumber,
            apartmentNumber: body.apartmentNumber,
            deliveryTime,
            deliveryNotes,
            gpsCoordinates,
            items,
            subtotal,
            deliveryFee: deliveryFee || 0,
            giftPackagingFee: body.giftPackagingFee || 0,
            total,
            paymentMethod,
            qualifiesForFreeDelivery: qualifiesForFreeDelivery || false,
            isGift: body.isGift || false,
            giftMessage: body.giftMessage || null,
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
      
      // Build detailed address with property info
      let fullAddress = customerAddress;
      if (body.propertyType === 'villa' && body.villaNumber) {
        fullAddress += language === "ar" 
          ? ` | 🏠 فيلا رقم ${body.villaNumber}`
          : ` | 🏠 Villa #${body.villaNumber}`;
      } else if (body.propertyType === 'apartment') {
        const aptDetails = [];
        if (body.buildingNumber) aptDetails.push((language === "ar" ? "مبنى" : "Building") + ` ${body.buildingNumber}`);
        if (body.floorNumber) aptDetails.push((language === "ar" ? "طابق" : "Floor") + ` ${body.floorNumber}`);
        if (body.apartmentNumber) aptDetails.push((language === "ar" ? "شقة" : "Apt") + ` ${body.apartmentNumber}`);
        if (aptDetails.length > 0) {
          fullAddress += ` | 🏢 ${aptDetails.join(', ')}`;
        }
      }
      
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
      const whatsappResponse = await fetch(`${process.env.SITE_URL || 'http://localhost:3000'}/api/notifications/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: process.env.ADMIN_WHATSAPP || "+966539666654",
          message: adminWhatsappMessage
        })
      });

      const whatsappResult = await whatsappResponse.json();
      console.log("WhatsApp notification result:", whatsappResult);
      
      if (whatsappResult.success && whatsappResult.whatsappUrl) {
        console.log("✅ WhatsApp notification link generated:", whatsappResult.whatsappUrl);
      }
    } catch (adminWhatsappError: any) {
      console.error("❌ Admin WhatsApp notification failed:", adminWhatsappError);
      console.error("Error details:", adminWhatsappError.message || adminWhatsappError);
      console.error("ADMIN_WHATSAPP env:", process.env.ADMIN_WHATSAPP ? "Set" : "NOT SET");
      console.error("TWILIO_WHATSAPP_NUMBER env:", process.env.TWILIO_WHATSAPP_NUMBER ? "Set" : "NOT SET");
      // Don't fail the order if admin notification fails
    }

    console.log("=== Order Creation Completed Successfully ===", { orderId, hasInvoice: !!base64Invoice });

    // REMOVED: WhatsApp redirect to customer's personal number
    // Customer now receives email confirmation with invoice
    // Admin receives Twilio SMS notifications for new orders
    // No need to redirect customer to their own WhatsApp

    return NextResponse.json({
      success: true,
      orderId,
      invoiceBase64: base64Invoice,
      orderData: orderData?.[0],
      hasEmail: !!customerEmail,
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
