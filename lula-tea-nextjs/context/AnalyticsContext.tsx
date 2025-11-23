"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface AnalyticsContextType {
  trackEvent: (eventType: string, data?: any) => void;
  visitorId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [visitorId, setVisitorId] = useState<string>("");

  useEffect(() => {
    // Get or create visitor ID
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("visitor_id", id);
    }
    setVisitorId(id);

    // Track page view
    trackPageView();
  }, []);

  const trackPageView = () => {
    if (typeof window === "undefined") return;
    
    const event = {
      event_type: "page_view",
      page_url: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    };

    saveEvent(event);
  };

  const trackEvent = (eventType: string, data: any = {}) => {
    if (!visitorId) return;

    const event = {
      visitor_id: visitorId,
      event_type: eventType,
      event_data: data,
      page_url: window.location.pathname,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
    };

    saveEvent(event);
  };

  const saveEvent = async (event: any) => {
    try {
      // Save to localStorage first (for offline support)
      const events = JSON.parse(localStorage.getItem("analytics_events") || "[]");
      events.push(event);
      
      // Keep only last 100 events in localStorage
      if (events.length > 100) {
        events.shift();
      }
      localStorage.setItem("analytics_events", JSON.stringify(events));

      // Send to server
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, visitorId }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
