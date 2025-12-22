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
  const [sessionStart, setSessionStart] = useState<number>(Date.now());
  const [lastTrackedPage, setLastTrackedPage] = useState<string>("");

  useEffect(() => {
    // Get or create visitor ID
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("visitor_id", id);
    }
    setVisitorId(id);

    // Track session start
    const start = Date.now();
    setSessionStart(start);
    localStorage.setItem("session_start", start.toString());

    // Track session end on page unload
    const handleBeforeUnload = () => {
      const sessionDuration = Math.floor((Date.now() - start) / 1000); // in seconds
      trackEvent("session_end", { 
        duration_seconds: sessionDuration,
        pages_visited: getVisitedPages().length 
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Track page views separately - only when pathname changes
  useEffect(() => {
    if (typeof window === "undefined" || !visitorId) return;
    
    const currentPage = window.location.pathname;
    
    // Only track if this is a new page (not already tracked)
    if (currentPage !== lastTrackedPage) {
      trackPageView();
      setLastTrackedPage(currentPage);
    }
  }, [visitorId, lastTrackedPage]);

  const trackPageView = () => {
    if (typeof window === "undefined") return;
    
    // Store visited pages
    const visitedPages = getVisitedPages();
    visitedPages.push({
      url: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("visited_pages", JSON.stringify(visitedPages));
    
    const event = {
      event_type: "page_view",
      page_url: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    };

    saveEvent(event);
  };

  const getVisitedPages = () => {
    try {
      return JSON.parse(localStorage.getItem("visited_pages") || "[]");
    } catch {
      return [];
    }
  };

  const trackEvent = (eventType: string, data: any = {}) => {
    if (!visitorId) return;

    // Add session duration to all events
    const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000);

    const event = {
      visitor_id: visitorId,
      event_type: eventType,
      event_data: {
        ...data,
        session_duration_seconds: sessionDuration,
        time_of_day: new Date().getHours(), // 0-23
        day_of_week: new Date().getDay(), // 0-6 (Sunday-Saturday)
      },
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
