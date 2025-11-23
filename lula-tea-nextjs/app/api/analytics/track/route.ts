import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    // Validate event data
    if (!event.event_type) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      );
    }

    // Save to Supabase
    const { error } = await supabase.from("analytics_events").insert([
      {
        visitor_id: event.visitor_id || null,
        event_type: event.event_type,
        event_data: event.event_data || {},
        page_url: event.page_url,
        referrer: event.referrer || null,
        user_agent: event.user_agent || null,
        screen_width: event.screen_width || null,
        screen_height: event.screen_height || null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Supabase analytics error:", error);
      // Don't fail the request - analytics should be non-blocking
      return NextResponse.json({ success: true, warning: "Analytics not saved" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics API error:", error);
    // Don't fail the request
    return NextResponse.json({ success: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get analytics data
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate metrics
    const events = data || [];
    const uniqueVisitors = new Set(events.map((e) => e.visitor_id)).size;
    const pageViews = events.filter((e) => e.event_type === "page_view").length;
    const addToCartEvents = events.filter((e) => e.event_type === "add_to_cart").length;
    const checkoutStarts = events.filter((e) => e.event_type === "checkout_start").length;
    const purchases = events.filter((e) => e.event_type === "purchase").length;

    const conversionRate = uniqueVisitors > 0 ? (purchases / uniqueVisitors) * 100 : 0;
    const cartConversionRate = addToCartEvents > 0 ? (purchases / addToCartEvents) * 100 : 0;

    return NextResponse.json({
      success: true,
      metrics: {
        uniqueVisitors,
        pageViews,
        addToCartEvents,
        checkoutStarts,
        purchases,
        conversionRate: conversionRate.toFixed(2),
        cartConversionRate: cartConversionRate.toFixed(2),
      },
      events,
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
