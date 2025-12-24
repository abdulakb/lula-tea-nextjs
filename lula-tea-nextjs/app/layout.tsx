import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import FloatingCartButton from "./components/FloatingCartButton";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import BackToTopButton from "./components/BackToTopButton";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import MobileBottomNav from "./components/MobileBottomNav";
import CustomCursor from "./components/CustomCursor";
import AppInsightsProvider from "./components/AppInsightsProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Lula Tea - Homemade with Love",
  description: "Discover our finest blend of loose leaf teas, carefully crafted with love. Each ingredient is thoughtfully selected to give you a unique taste experience.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lula Tea",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7a9b76" },
    { media: "(prefers-color-scheme: dark)", color: "#8fb38a" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: [
      { url: '/images/logo.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/images/logo.jpg', sizes: '16x16', type: 'image/jpeg' },
    ],
    apple: '/images/logo.jpg',
    shortcut: '/images/logo.jpg',
  },
  openGraph: {
    title: "Lula Tea - Homemade with Love",
    description: "Discover our finest blend of loose leaf teas, carefully crafted with love.",
    url: "https://lulatee.com",
    siteName: "Lula Tea",
    images: [
      {
        url: '/images/logo.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Lula Tea - Homemade with Love",
    description: "Discover our finest blend of loose leaf teas, carefully crafted with love.",
    images: ['/images/logo.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-warm-cream font-sans">
        <AppInsightsProvider>
            <AnalyticsProvider>
              <LanguageProvider>
                <CartProvider>
                  <ToastProvider>
                    <Header />
                    {children}
                    <Footer />
                    <ChatWidget />
                    <FloatingCartButton />
                    <FloatingWhatsAppButton />
                    <BackToTopButton />
                    <PWAInstallPrompt />
                    <MobileBottomNav />
                    <CustomCursor />
                  </ToastProvider>
                </CartProvider>
              </LanguageProvider>
            </AnalyticsProvider>
        </AppInsightsProvider>
      </body>
    </html>
  );
}
