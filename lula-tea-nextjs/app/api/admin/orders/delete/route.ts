import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function DELETE(req: NextRequest) {
  try {
    const { orderId, orderIds } = await req.json();

    // Handle single order deletion
    if (orderId) {
      // First, get the order details to restore stock
      const { data: order, error: fetchError } = await supabaseAdmin
        .from("orders")
        .select("items, delivery_city")
        .eq("id", orderId)
        .single();

      if (fetchError) {
        console.error("Error fetching order for deletion:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch order details" },
          { status: 500 }
        );
      }

      // Restore stock for each item in the order
      if (order && order.items) {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        const deliveryCity = order.delivery_city || 'Riyadh';
        
        for (const item of items) {
          const totalBags = item.quantity || 0;
          
          if (totalBags > 0) {
            // Determine which stock column to update based on delivery city
            const stockColumn = deliveryCity === 'Jeddah' ? 'jeddah_stock' : 'riyadh_stock';
            
            // Restore stock by adding back the quantity
            const { error: stockError } = await supabaseAdmin.rpc(
              'increment_stock',
              {
                product_id: 'lula-tea-premium-200g',
                quantity_change: totalBags,
                city: deliveryCity,
              }
            );

            if (stockError) {
              console.error(`Error restoring stock for ${deliveryCity}:`, stockError);
              // Continue with deletion even if stock restoration fails
            } else {
              console.log(`✅ Restored ${totalBags} bags to ${deliveryCity} stock for deleted order ${orderId}`);
            }
          }
        }
      }

      // Delete the order
      const { error } = await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) {
        console.error("Error deleting order:", error);
        return NextResponse.json(
          { error: "Failed to delete order" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, stockRestored: true });
    }

    // Handle bulk deletion
    if (orderIds && Array.isArray(orderIds)) {
      // Fetch all orders to restore stock
      const { data: orders, error: fetchError } = await supabaseAdmin
        .from("orders")
        .select("id, items, delivery_city")
        .in("id", orderIds);

      if (fetchError) {
        console.error("Error fetching orders for bulk deletion:", fetchError);
      } else if (orders) {
        // Restore stock for each order
        for (const order of orders) {
          if (order.items) {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            const deliveryCity = order.delivery_city || 'Riyadh';
            
            for (const item of items) {
              const totalBags = item.quantity || 0;
              
              if (totalBags > 0) {
                await supabaseAdmin.rpc(
                  'increment_stock',
                  {
                    product_id: 'lula-tea-premium-200g',
                    quantity_change: totalBags,
                    city: deliveryCity,
                  }
                );
              }
            }
          }
        }
      }

      // Delete the orders
      const { error } = await supabaseAdmin
        .from("orders")
        .delete()
        .in("id", orderIds);

      if (error) {
        console.error("Error deleting orders:", error);
        return NextResponse.json(
          { error: "Failed to delete orders" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, count: orderIds.length, stockRestored: true });
    }

    return NextResponse.json(
      { error: "Invalid request - missing orderId or orderIds" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in delete orders API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
