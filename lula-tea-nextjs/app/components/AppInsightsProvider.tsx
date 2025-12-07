"use client";

import { useEffect } from 'react';
import { initAppInsights } from '@/lib/appInsights';

export default function AppInsightsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAppInsights();
  }, []);

  return <>{children}</>;
}
