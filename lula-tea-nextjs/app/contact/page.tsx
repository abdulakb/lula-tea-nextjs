"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t, language } = useLanguage();
  
  return (
    <main className="min-h-screen py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-deep-brown mb-3 md:mb-4">
            {t('contactTitle')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-tea-brown max-w-2xl mx-auto px-4">
            {t('contactDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* WhatsApp Section */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 lg:p-12">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-deep-brown mb-3">
                {t('orderViaWhatsAppTitle')}
              </h2>
              <p className="text-tea-brown mb-6">
                {t('scanQRDescription')}
              </p>
            </div>

            {/* WhatsApp QR Code */}
            <div className="bg-warm-cream rounded-2xl p-8 mb-6">
              <div className="relative w-full max-w-xs mx-auto aspect-square">
                <Image
                  src="/images/whatsapp-barcode.jpg"
                  alt="WhatsApp QR Code"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-tea-brown mb-4">
                {language === "ar" ? "أو انقر على الزر أدناه لبدء محادثة" : "Or click the button below to start a conversation"}
              </p>
              <a
                href="https://wa.me/966539666654"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22c55e] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                {t('chatOnWhatsApp')}
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Why Contact Us */}
            <div className="bg-gradient-to-br from-tea-green/10 to-soft-sage/10 rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-deep-brown mb-6">
                {t('whyContactTitle')}
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-tea-green flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-deep-brown mb-1">{t('quickResponse')}</h3>
                    <p className="text-tea-brown">{t('quickResponseDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-tea-green flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-deep-brown mb-1">{t('personalizedService')}</h3>
                    <p className="text-tea-brown">{t('personalizedServiceDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-tea-green flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-deep-brown mb-1">{t('easyOrdering')}</h3>
                    <p className="text-tea-brown">{t('easyOrderingDesc')}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-tea-green flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-deep-brown mb-1">{t('qualityGuarantee')}</h3>
                    <p className="text-tea-brown">{t('qualityGuaranteeDesc')}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-deep-brown mb-6">
                {language === "ar" ? "لنتواصل" : "Let's Connect"}
              </h2>
              <p className="text-tea-brown mb-6">
                {language === "ar" 
                  ? "لديك أسئلة حول مزيج الشاي؟ تريد تقديم طلب مخصص؟ أو فقط تريد الدردشة عن الشاي؟ نحن هنا للمساعدة!"
                  : "Have questions about our tea blends? Want to place a custom order? Or just want to chat about tea? We're here to help!"}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-tea-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-tea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-deep-brown">{language === "ar" ? "وقت الاستجابة" : "Response Time"}</p>
                    <p className="text-tea-brown">{language === "ar" ? "عادة خلال بضع ساعات" : "Usually within a few hours"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-deep-brown">{language === "ar" ? "وسيلة الاتصال المفضلة" : "Preferred Contact"}</p>
                    <p className="text-tea-brown">{language === "ar" ? "واتساب للرد الأسرع" : "WhatsApp for fastest response"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-tea-green to-soft-sage text-white rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "ar" ? "جاهز للطلب؟" : "Ready to Order?"}
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            {language === "ar" 
              ? "اختبر أفضل مزيج من أوراق الشاي الفاخرة، مُحضّر بحب"
              : "Experience the finest blend of loose leaf teas, handcrafted with love"}
          </p>
          <a 
            href="/#product"
            className="inline-block bg-white hover:bg-warm-cream text-tea-green px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            {language === "ar" ? "اطلب الآن" : "View Our Tea"}
          </a>
        </div>
      </div>
    </main>
  );
}
