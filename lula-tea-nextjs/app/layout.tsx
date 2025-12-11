import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import FloatingCartButton from "./components/FloatingCartButton";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import BackToTopButton from "./components/BackToTopButton";
import AppInsightsProvider from "./components/AppInsightsProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lula Tea - Homemade with Love",
  description: "Discover our finest blend of loose leaf teas, carefully crafted with love. Each ingredient is thoughtfully selected to give you a unique taste experience.",
  manifest: "/manifest.json",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark-transition`}
      >
        <AppInsightsProvider>
          <ThemeProvider>
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
                  </ToastProvider>
                </CartProvider>
              </LanguageProvider>
            </AnalyticsProvider>
          </ThemeProvider>
        </AppInsightsProvider>
      </body>
    </html>
  );
}
