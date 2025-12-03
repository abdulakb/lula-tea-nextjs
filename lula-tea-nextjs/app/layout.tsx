import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";

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
    icon: '/images/logo.jpg',
    apple: '/images/logo.jpg',
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnalyticsProvider>
          <LanguageProvider>
            <CartProvider>
              <Header />
              {children}
              <Footer />
              <ChatWidget />
            </CartProvider>
          </LanguageProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
