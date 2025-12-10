import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, product_name, email, phone, notify_via, language } = body;

    // Validate required fields
    if (!product_id || !product_name || !notify_via) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (notify_via === 'email' && !email) {
      return NextResponse.json(
        { error: 'Email is required for email notifications' },
        { status: 400 }
      );
    }

    if (notify_via === 'whatsapp' && !phone) {
      return NextResponse.json(
        { error: 'Phone is required for WhatsApp notifications' },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from('stock_notifications')
      .insert([
        {
          product_id,
          product_name,
          email: email || null,
          phone: phone || null,
          notify_via,
          language: language || 'en',
          notified: false,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to register notification', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully registered for stock notification',
        data 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering stock notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const notified = searchParams.get('notified');

    let query = supabase
      .from('stock_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (notified !== null) {
      query = query.eq('notified', notified === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications: data || [] });
  } catch (error) {
    console.error('Error fetching stock notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
