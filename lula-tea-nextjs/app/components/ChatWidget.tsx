"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.error || "Sorry, I couldn't process that.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: language === "ar" 
          ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب: +966 53 966 6654"
          : "Sorry, an error occurred. Please try again or contact us on WhatsApp: +966 53 966 6654",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-tea-green hover:bg-tea-green/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Chat Assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-gold rounded-full animate-pulse" />
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-tea-green to-soft-sage text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {language === "ar" ? "مساعد لولا تي" : "Lula Tea Assistant"}
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 7H7v6h6V7z" />
                      <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] font-medium text-white">
                      {language === "ar" ? "مدعوم بالذكاء الاصطناعي" : "Powered by AI"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-warm-cream/30" style={{ maxHeight: "400px" }}>
            {messages.length === 0 && (
              <div className="py-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-tea-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-tea-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                  </div>
                  <p className="text-deep-brown dark:text-gray-800 text-sm font-semibold">
                    {language === "ar"
                      ? "مرحباً! كيف يمكنني مساعدتك اليوم؟"
                      : "Hi! How can I help you today?"}
                  </p>
                </div>
                
                {/* Suggested Questions */}
                <div className="space-y-2">
                  <p className="text-xs text-deep-brown/60 font-medium px-1 mb-2">
                    {language === "ar" ? "أسئلة مقترحة:" : "Suggested questions:"}
                  </p>
                  <button
                    onClick={() => setInput(language === "ar" ? "ما الفرق بين شايكم وشاي السوبرماركت؟" : "What's the difference between your tea and supermarket tea?")}
                    className="w-full text-left bg-white hover:bg-tea-green/10 border border-tea-brown/10 rounded-xl px-3 py-2.5 text-sm transition-colors"
                  >
                    <span className="font-medium text-deep-brown">
                      {language === "ar" ? "🌟 ما الفرق بين شايكم وشاي السوبرماركت؟" : "🌟 What's the difference between your tea and supermarket tea?"}
                    </span>
                  </button>
                  <button
                    onClick={() => setInput(language === "ar" ? "كم السعر وكيف أطلب؟" : "What's the price and how to order?")}
                    className="w-full text-left bg-white hover:bg-tea-green/10 border border-tea-brown/10 rounded-xl px-3 py-2.5 text-sm transition-colors"
                  >
                    <span className="font-medium text-deep-brown">
                      {language === "ar" ? "💰 كم السعر وكيف أطلب؟" : "💰 What's the price and how to order?"}
                    </span>
                  </button>
                  <button
                    onClick={() => setInput(language === "ar" ? "ما هي فوائد الشاي الأخضر الصحية؟" : "What are the health benefits of green tea?")}
                    className="w-full text-left bg-white hover:bg-tea-green/10 border border-tea-brown/10 rounded-xl px-3 py-2.5 text-sm transition-colors"
                  >
                    <span className="font-medium text-deep-brown">
                      {language === "ar" ? "💚 ما هي فوائد الشاي الأخضر الصحية؟" : "💚 What are the health benefits of green tea?"}
                    </span>
                  </button>
                  <button
                    onClick={() => setInput(language === "ar" ? "كيف أحضر كوب شاي مثالي؟" : "How do I brew the perfect cup?")}
                    className="w-full text-left bg-white hover:bg-tea-green/10 border border-tea-brown/10 rounded-xl px-3 py-2.5 text-sm transition-colors"
                  >
                    <span className="font-medium text-deep-brown">
                      {language === "ar" ? "☕ كيف أحضر كوب شاي مثالي؟" : "☕ How do I brew the perfect cup?"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-tea-green text-white"
                      : "bg-white shadow-sm border border-gray-100"
                  }`}
                >
                  <p className={`text-sm whitespace-pre-wrap ${
                    message.role === "user" ? "text-white" : "text-gray-900"
                  }`}>{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-deep-brown rounded-2xl px-4 py-2 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-tea-green rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-tea-green rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-tea-green rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-tea-brown/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={
                  language === "ar" ? "اكتب رسالتك..." : "Type your message..."
                }
                className="flex-1 px-4 py-2 rounded-full border border-tea-brown/20 focus:border-tea-green focus:outline-none focus:ring-2 focus:ring-tea-green/20 text-sm text-gray-900 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-tea-green hover:bg-tea-green/90 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
