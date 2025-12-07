import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

let reactPlugin: ReactPlugin | null = null;
let appInsights: ApplicationInsights | null = null;

export const initAppInsights = () => {
  if (typeof window === 'undefined') return null;

  const connectionString = process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING;
  
  if (!connectionString) {
    console.warn('Azure Application Insights connection string not found - analytics disabled');
    return null;
  }

  if (appInsights) {
    return { reactPlugin, appInsights };
  }

  try {
    reactPlugin = new ReactPlugin();
    appInsights = new ApplicationInsights({
      config: {
        connectionString: connectionString,
        extensions: [reactPlugin],
        enableAutoRouteTracking: true,
        disableAjaxTracking: false,
        autoTrackPageVisitTime: true,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
      }
    });

    appInsights.loadAppInsights();

    // Track page views
    appInsights.trackPageView();

    return { reactPlugin, appInsights };
  } catch (error) {
    console.error('Failed to initialize Application Insights:', error);
    return null;
  }
};

export const getAppInsights = () => appInsights;

// Custom event tracking helpers
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  try {
    if (appInsights) {
      appInsights.trackEvent({ name }, properties);
    }
  } catch (error) {
    console.warn('Failed to track event:', name, error);
  }
};

export const trackAddToCart = (productId: string, quantity: number, price: number) => {
  trackEvent('AddToCart', {
    productId,
    quantity,
    totalPrice: price * quantity
  });
};

export const trackCheckoutStarted = (totalAmount: number, itemCount: number) => {
  trackEvent('CheckoutStarted', {
    totalAmount,
    itemCount
  });
};

export const trackOrderCompleted = (orderId: string, totalAmount: number, paymentMethod: string) => {
  trackEvent('OrderCompleted', {
    orderId,
    totalAmount,
    paymentMethod
  });
};

export const trackChatMessage = (messageLength: number, language: string) => {
  trackEvent('ChatMessageSent', {
    messageLength,
    language
  });
};

export const trackReviewSubmitted = (ratings: Record<string, number>) => {
  trackEvent('ReviewSubmitted', ratings);
};
