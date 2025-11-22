"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, language } = useLanguage();
  
  return (
    <footer className="bg-deep-brown text-warm-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-gold">Lula Tea</h3>
            <p className="text-sm text-warm-cream/80">
              {t("footerAbout")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-gold">{t("quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-accent-gold transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/product" className="hover:text-accent-gold transition-colors">
                  {t("product")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent-gold transition-colors">
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-accent-gold transition-colors">
                  {t("privacyTitle")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-accent-gold transition-colors">
                  {t("termsTitle")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-accent-gold">{t("getInTouch")}</h3>
            <p className="text-sm text-warm-cream/80 mb-3">
              {t("getInTouchDescription")}
            </p>
            <a 
              href={process.env.NEXT_PUBLIC_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#25D366] hover:bg-[#22c55e] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-warm-cream/20 text-center text-sm text-warm-cream/60">
          <p>&copy; {new Date().getFullYear()} {t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
