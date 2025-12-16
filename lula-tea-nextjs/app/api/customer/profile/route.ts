import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { phone, name, email, address, city } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if customer exists first
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    let customer;

    if (existingCustomer) {
      // Update existing customer
      const { data: updated, error } = await supabase
        .from('customers')
        .update({
          name: name || null,
          email: email || null,
          address: address || null,
          city: city || null,
          updated_at: new Date().toISOString(),
        })
        .eq('phone', phone)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }
      customer = updated;
    } else {
      // Create new customer if doesn't exist
      const { data: created, error } = await supabase
        .from('customers')
        .insert([{
          phone,
          name: name || null,
          email: email || null,
          address: address || null,
          city: city || null,
          verified: true,
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }
      customer = created;
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      customer,
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
