export const runtime = "edge";

// Mock AI responses for Lula Tea
const lulaTeaKnowledge = {
  product: {
    name: "Premium Loose Leaf Blend",
    nameAr: "مزيج أوراق الشاي المميز",
    price: "30 SAR",
    weight: "250g",
    description: "Handcrafted premium loose leaf tea blend made with carefully selected ingredients",
    descriptionAr: "مزيج أوراق شاي فاخر محضّر يدوياً بمكونات مُختارة بعناية",
  },
  contact: {
    phone: "+966 53 966 6654",
    whatsapp: "+966 53 966 6654",
    whatsappUrl: "https://wa.me/966539666654",
    orderMethods: ["Website cart", "WhatsApp direct"],
  },
};

function detectLanguage(text: string): "en" | "ar" {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? "ar" : "en";
}

function generateMockResponse(userMessage: string, language: "en" | "ar"): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|مرحبا|السلام|أهلا)/i)) {
    return language === "ar"
      ? "مرحباً! أنا مساعد لولا تي 🍵\n\nكيف يمكنني مساعدتك اليوم؟ يمكنني مساعدتك في:\n- معلومات عن منتجاتنا\n- الأسعار والطلب\n- نصائح تحضير الشاي\n- طرق التواصل معنا\n\n📱 للتواصل المباشر: " + lulaTeaKnowledge.contact.phone
      : "Hello! I'm the Lula Tea assistant 🍵\n\nHow can I help you today? I can assist with:\n- Product information\n- Pricing and ordering\n- Tea brewing tips\n- Contact information\n\n📱 Contact us directly: " + lulaTeaKnowledge.contact.phone;
  }
  
  // Contact / Phone / WhatsApp questions
  if (lowerMessage.match(/(contact|phone|call|whatsapp|reach|تواصل|اتصال|رقم|واتساب)/i)) {
    return language === "ar"
      ? `يمكنك التواصل معنا بسهولة! 📱\n\n📞 رقم الهاتف/واتساب:\n${lulaTeaKnowledge.contact.phone}\n\n💬 طرق التواصل:\n1️⃣ واتساب مباشر (الأسرع)\n2️⃣ اتصال هاتفي\n3️⃣ رسالة نصية\n\nنحن متاحون للرد على استفساراتك!\n\nهل تريد أن أساعدك في شيء آخر؟`
      : `You can reach us easily! 📱\n\n📞 Phone/WhatsApp:\n${lulaTeaKnowledge.contact.phone}\n\n💬 Contact methods:\n1️⃣ WhatsApp direct (fastest)\n2️⃣ Phone call\n3️⃣ Text message\n\nWe're available to answer your questions!\n\nIs there anything else I can help you with?`;
  }
  
  // Product questions
  if (lowerMessage.match(/(product|tea|blend|what do you sell|ماذا تبيع|منتج|شاي)/i)) {
    return language === "ar"
      ? `نحن نقدم ${lulaTeaKnowledge.product.nameAr}! 🌿\n\n✨ ${lulaTeaKnowledge.product.descriptionAr}\n💰 السعر: ${lulaTeaKnowledge.product.price}\n📦 الوزن: ${lulaTeaKnowledge.product.weight}\n\nكل دفعة محضّرة بحب واهتمام بالتفاصيل. هل تريد طلبه؟`
      : `We offer our ${lulaTeaKnowledge.product.name}! 🌿\n\n✨ ${lulaTeaKnowledge.product.description}\n💰 Price: ${lulaTeaKnowledge.product.price}\n📦 Weight: ${lulaTeaKnowledge.product.weight}\n\nEach batch is made with love and attention to detail. Would you like to order?`;
  }
  
  // Price questions
  if (lowerMessage.match(/(price|cost|how much|كم|السعر|التكلفة)/i)) {
    return language === "ar"
      ? `سعر مزيج الشاي المميز ${lulaTeaKnowledge.product.weight} هو ${lulaTeaKnowledge.product.price} 💰\n\nيمكنك الطلب عبر:\n📱 واتساب: ${lulaTeaKnowledge.contact.phone}\n🛒 سلة التسوق في الموقع\n\nهل تريد إضافته إلى السلة؟`
      : `Our Premium Tea Blend ${lulaTeaKnowledge.product.weight} costs ${lulaTeaKnowledge.product.price} 💰\n\nYou can order via:\n📱 WhatsApp: ${lulaTeaKnowledge.contact.phone}\n🛒 Website cart\n\nWould you like to add it to your cart?`;
  }
  
  // Brewing tips (check before ordering to avoid conflict)
  if (lowerMessage.match(/(brew|prepare|make tea|how to make tea|how to prepare|preparation|كيف احضر|طريقة التحضير|تحضير الشاي|اعداد)/i)) {
    return language === "ar"
      ? `خطوات التحضير: ☕️\n\n١. اخلط خلطة الشاي جيداً قبل كل استخدام\n\n٢. خذ المقدار المناسب من خلطة الشاي، ثم اغسله غسلة خفيفة بالماء\n\n٣. اسكب عليه ماءً مغلياً واتركه على نار هادئة حتى يأخذ الشاي لونه ونكهته\n\nوبالعافية.. 🍵✨\n\n💡 نصيحة: يمكنك التحكم في قوة النكهة حسب رغبتك\n\nهل تريد معرفة المزيد؟`
      : `Brewing Steps: ☕️\n\n1. Mix the tea blend well before each use\n\n2. Take the appropriate amount of tea blend, then rinse it lightly with water\n\n3. Pour boiling water over it and leave it on low heat until the tea gets its color and flavor\n\nEnjoy! 🍵✨\n\n💡 Tip: You can control the strength of the flavor to your preference\n\nWould you like to know more?`;
  }
  
  // Ordering questions
  if (lowerMessage.match(/(order|buy|purchase|how to order|طلب|شراء|كيف اطلب)/i)) {
    return language === "ar"
      ? `يمكنك طلب شاي لولا بطريقتين سهلتين:\n\n1️⃣ 📱 عبر واتساب: ${lulaTeaKnowledge.contact.phone}\n   (انقر زر واتساب في أي صفحة)\n\n2️⃣ 🛒 عبر الموقع:\n   - أضف المنتج للسلة\n   - انتقل للسلة\n   - أكمل الطلب عبر واتساب\n\nنحن هنا لمساعدتك! 💚`
      : `You can order Lula Tea in two easy ways:\n\n1️⃣ 📱 Via WhatsApp: ${lulaTeaKnowledge.contact.phone}\n   (Click the WhatsApp button on any page)\n\n2️⃣ 🛒 Through the website:\n   - Add product to cart\n   - Go to cart\n   - Complete order via WhatsApp\n\nWe're here to help! 💚`;
  }
  
  // Ingredients
  if (lowerMessage.match(/(ingredient|what's in|مكونات|محتويات)/i)) {
    return language === "ar"
      ? `مزيجنا يحتوي على أوراق شاي فاخرة مُختارة بعناية 🌿\n\n✨ كل مكون محسوب بدقة\n💚 محضّر بحب\n🎯 مزيج فريد لا يُنسى\n\nنحن نختار فقط أجود المكونات لضمان تجربة طعم استثنائية. للمزيد من التفاصيل، تواصل معنا عبر واتساب!`
      : `Our blend contains carefully selected premium tea leaves 🌿\n\n✨ Every ingredient is precisely calculated\n💚 Made with love\n🎯 Unique unforgettable blend\n\nWe select only the finest ingredients to ensure an exceptional taste experience. For more details, reach out via WhatsApp!`;
  }
  
  // Coming soon / Other products
  if (lowerMessage.match(/(other|more|accessories|teapot|mug|أخرى|المزيد|إكسسوارات)/i)) {
    return language === "ar"
      ? `قريباً! 🎉\n\nنعمل على توسيع مجموعتنا:\n🍵 مزيجات شاي جديدة\n🫖 أباريق شاي أنيقة\n☕ أكواب مميزة\n\nترقبوا الجديد من عائلة لولا تي! تابعنا لتكون أول من يعرف.\n\nهل تريد طلب مزيجنا الحالي؟`
      : `Coming Soon! 🎉\n\nWe're expanding our collection:\n🍵 New tea blends\n🫖 Elegant teapots\n☕ Beautiful mugs\n\nStay tuned for exciting additions to the Lula Tea family! Follow us to be the first to know.\n\nWould you like to order our current blend?`;
  }
  
  // Thank you
  if (lowerMessage.match(/(thank|thanks|شكرا)/i)) {
    return language === "ar"
      ? "العفو! يسعدنا خدمتك 💚\n\nإذا كنت بحاجة لأي شيء آخر، أنا هنا لمساعدتك!\n\n📱 أو تواصل معنا مباشرة: " + lulaTeaKnowledge.contact.phone
      : "You're welcome! Happy to help 💚\n\nIf you need anything else, I'm here to assist!\n\n📱 Or reach us directly: " + lulaTeaKnowledge.contact.phone;
  }
  
  // Default response
  return language === "ar"
    ? `شكراً لسؤالك! 🍵\n\nأنا هنا لمساعدتك في:\n✅ معلومات عن منتج الشاي\n✅ الأسعار (${lulaTeaKnowledge.product.price})\n✅ كيفية الطلب\n✅ نصائح التحضير\n✅ طرق التواصل\n\nما الذي تود معرفته؟\n\n📱 للتواصل المباشر: ${lulaTeaKnowledge.contact.phone}`
    : `Thanks for asking! 🍵\n\nI'm here to help you with:\n✅ Tea product information\n✅ Pricing (${lulaTeaKnowledge.product.price})\n✅ How to order\n✅ Brewing tips\n✅ Contact information\n\nWhat would you like to know?\n\n📱 Contact us directly: ${lulaTeaKnowledge.contact.phone}`;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1];
    const language = detectLanguage(lastMessage.content);
    
    // Simulate streaming delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = generateMockResponse(lastMessage.content, language);
    
    // Return as plain text stream (compatible with the chat widget)
    return new Response(response, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    
    return new Response(
      "I apologize for the technical issue. Please contact us on WhatsApp: +966 53 966 6654 📱",
      {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }
}
