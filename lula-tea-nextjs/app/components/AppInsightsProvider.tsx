"use client";

import { useEffect } from 'react';
import { initAppInsights } from '@/lib/appInsights';

export default function AppInsightsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const result = initAppInsights();
    if (result) {
      console.log('✅ Application Insights initialized successfully');
    } else {
      console.warn('⚠️ Application Insights not initialized - check connection string');
    }
  }, []);

  return <>{children}</>;
}
