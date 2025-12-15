import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    const orderId = searchParams.get('order_id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (orderId) {
      // Get specific order
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('customer_id', customerId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ order: data });
    }

    // Get all orders for customer
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, customerId, action, updates } = await request.json();

    if (!orderId || !customerId) {
      return NextResponse.json(
        { error: 'Order ID and Customer ID are required' },
        { status: 400 }
      );
    }

    // Verify order belongs to customer
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_id', customerId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be modified
    const modifiableStatuses = ['pending', 'processing'];
    
    if (action === 'cancel') {
      if (!modifiableStatuses.includes(order.status)) {
        return NextResponse.json(
          { error: 'Order cannot be cancelled at this stage' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to cancel order' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Order cancelled successfully',
        order: data,
      });
    }

    if (action === 'update') {
      if (!['pending', 'processing'].includes(order.status)) {
        return NextResponse.json(
          { error: 'Order can only be modified while pending or processing' },
          { status: 400 }
        );
      }

      // Prepare update object
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Allow updating specific fields
      if (updates.customer_name) updateData.customer_name = updates.customer_name;
      if (updates.customer_email !== undefined) updateData.customer_email = updates.customer_email;
      if (updates.customer_phone) updateData.customer_phone = updates.customer_phone;
      if (updates.delivery_address) {
        updateData.delivery_address = updates.delivery_address;
        updateData.delivery_address_formatted = updates.delivery_address;
      }
      if (updates.city) updateData.city = updates.city;
      if (updates.delivery_notes !== undefined) updateData.delivery_notes = updates.delivery_notes;
      if (updates.delivery_time_preference !== undefined) updateData.delivery_time_preference = updates.delivery_time_preference;
      
      // Handle items update (only if pending)
      if (updates.items && order.status === 'pending') {
        // Parse existing items
        const oldItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        const newItems = updates.items;
        
        // Calculate new totals
        const newSubtotal = newItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const newTotal = newSubtotal + (order.delivery_fee || 0);
        
        updateData.items = JSON.stringify(newItems);
        updateData.subtotal = newSubtotal;
        updateData.total = newTotal;
        updateData.quantity_ordered = newItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        
        // TODO: Handle stock adjustments
        // - Return stock for removed/reduced items
        // - Deduct stock for new/increased items
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Order updated successfully',
        order: data,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing customer order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
