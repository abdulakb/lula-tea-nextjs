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
      if (order.status !== 'pending') {
        return NextResponse.json(
          { error: 'Order can only be modified while pending' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
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
