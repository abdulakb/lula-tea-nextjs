"use client";

import { useLanguage } from "@/context/LanguageContext";
import StoryCarousel from "../components/StoryCarousel";
import Image from "next/image";

export default function StoryPage() {
  const { language, t } = useLanguage();

  const storyScenes = [
    {
      titleEn: "It started with Lula's love for exceptional tea",
      titleAr: "بدأت القصة بحب لولا للشاي الاستثنائي",
      descEn: "Lula has always appreciated the art of premium tea. She would receive exquisite tea gifts and treasure each unique blend.",
      descAr: "لطالما قدّرت لولا فن الشاي الفاخر. كانت تتلقى هدايا شاي رائعة وتعتز بكل مزيج فريد."
    },
    {
      titleEn: "She carefully blended premium tea leaves",
      titleAr: "كانت تمزج أوراق الشاي الفاخرة بعناية",
      descEn: "With passion and expertise, Lula would create custom blends, combining different premium varieties to craft the perfect cup.",
      descAr: "بشغف وخبرة، كانت لولا تصنع مزيجات مخصصة، تجمع بين أنواع فاخرة مختلفة لصنع الكوب المثالي."
    },
    {
      titleEn: "Every blend stored in jars for daily moments and guests",
      titleAr: "كل مزيج يُحفظ في برطمان للحظات اليومية والضيوف",
      descEn: "Each carefully crafted blend was stored in beautiful jars, ready to be enjoyed daily or shared with beloved guests.",
      descAr: "كل مزيج مصنوع بعناية يُحفظ في برطمانات جميلة، جاهز للاستمتاع به يومياً أو مشاركته مع الضيوف الأعزاء."
    },
    {
      titleEn: "When guests visited, they fell in love with her tea",
      titleAr: "عندما يزورها الضيوف، يقعون في حب شايها",
      descEn: "True Saudi hospitality meant sharing tea with every guest. The response was always the same - they loved it.",
      descAr: "الضيافة السعودية الحقيقية تعني مشاركة الشاي مع كل ضيف. كانت الإجابة دائماً واحدة - لقد أحبوه."
    },
    {
      titleEn: "Friends kept asking: 'Can we take some home?'",
      titleAr: "الأصدقاء يسألون: 'هل يمكننا أخذ بعضه للمنزل؟'",
      descEn: "The requests kept coming. Guests didn't just compliment the tea - they wanted to take it home with them.",
      descAr: "استمرت الطلبات. لم يكن الضيوف يمدحون الشاي فقط - بل أرادوا أخذه معهم إلى المنزل."
    },
    {
      titleEn: "And so, Lula Tea was born",
      titleAr: "وهكذا وُلد شاي لولا",
      descEn: "What began as a personal passion became a mission: to share exceptional tea experiences with everyone.",
      descAr: "ما بدأ كشغف شخصي أصبح رسالة: مشاركة تجارب الشاي الاستثنائية مع الجميع."
    }
  ];

  return (
    <div className="min-h-screen bg-warm-cream">
      
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-tea-green/20 to-accent-gold/10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-deep-brown mb-4 md:mb-6">
            {language === "ar" ? "قصتنا" : "Our Story"}
          </h1>
          <p className="text-xl md:text-2xl text-tea-brown font-serif italic">
            {language === "ar" 
              ? "من كوب مُشارك إلى حلم تحقق" 
              : "From a Cup Shared, to a Dream Realized"}
          </p>
        </div>
      </section>

      {/* Story Video Section */}
      <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <StoryCarousel language={language} />
          <p className="text-tea-brown/60 text-xs md:text-sm text-center mt-4 md:mt-6">
            {language === "ar" 
              ? "تم إنشاؤه باستخدام Microsoft 365 Copilot Create"
              : "Created with Microsoft 365 Copilot Create"}
          </p>
        </div>
      </section>

      {/* Our Story Paragraph */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-warm-cream to-soft-sage/10">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg md:prose-xl prose-tea mx-auto text-center">
            {language === "ar" ? (
              <div className="space-y-6 text-tea-brown" dir="rtl">
                <p className="text-xl md:text-2xl leading-relaxed">
                  بدأت قصة <span className="font-bold text-tea-green">شاي لولا</span> من حب خالص للشاي الفاخر. بشغف وخبرة، بدأت لولا في صنع مزيجاتها الخاصة، تجمع بين أفضل أنواع الشاي لصنع الكوب المثالي.
                </p>
                <p className="text-xl md:text-2xl leading-relaxed font-semibold text-tea-green">
                  وعندما بدأ الضيوف يسألون "هل يمكننا أخذ بعضه للمنزل؟" وُلدت الفكرة. شاي لولا هو قصة حب للشاي الاستثنائي.
                </p>
              </div>
            ) : (
              <div className="space-y-6 text-tea-brown">
                <p className="text-xl md:text-2xl leading-relaxed">
                  The story of <span className="font-bold text-tea-green">Lula Tea</span> began with a pure love for exceptional tea. With passion and expertise, Lula started crafting custom blends, combining the finest varieties to create the perfect cup.
                </p>
                <p className="text-xl md:text-2xl leading-relaxed font-semibold text-tea-green">
                  When guests started asking "Can we take some home?" the idea was born. Lula Tea is a love story for exceptional tea.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-tea-green to-tea-green/80">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {language === "ar" 
              ? "كن جزءاً من قصتنا" 
              : "Be Part of Our Story"}
          </h2>
          <p className="text-xl mb-8 text-white/90">
            {language === "ar"
              ? "جرّب الشاي الذي بدأ من شغف واحد وأصبح تجربة مشتركة"
              : "Experience the tea that started from one passion and became a shared experience"}
          </p>
          <a
            href="/product"
            className="inline-block bg-white hover:bg-warm-cream text-tea-green px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            {language === "ar" ? "اكتشف مجموعتنا" : "Discover Our Collection"}
          </a>
        </div>
      </section>
    </div>
  );
}
