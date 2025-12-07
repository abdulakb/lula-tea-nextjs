"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";

interface MessageTemplate {
  id: string;
  customerMessage: string;
  language: "ar" | "en";
  generatedResponse: string;
  timestamp: string;
}

export default function SmartResponsesPage() {
  const router = useRouter();
  const [customerMessage, setCustomerMessage] = useState("");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<MessageTemplate[]>([]);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push("/admin");
      return;
    }
    
    // Load history from localStorage
    const saved = localStorage.getItem("responseHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, [router]);

  const generateResponse = async () => {
    if (!customerMessage.trim()) return;

    setIsGenerating(true);
    setGeneratedResponse("");

    try {
      const response = await fetch("/api/admin/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerMessage: customerMessage.trim(),
          language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedResponse(data.response);
        
        // Add to history
        const newEntry: MessageTemplate = {
          id: Date.now().toString(),
          customerMessage: customerMessage.trim(),
          language,
          generatedResponse: data.response,
          timestamp: new Date().toISOString(),
        };
        
        const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
        setHistory(updatedHistory);
        localStorage.setItem("responseHistory", JSON.stringify(updatedHistory));
      } else {
        alert(data.error || "Failed to generate response");
      }
    } catch (error) {
      console.error("Error generating response:", error);
      alert("Error generating response");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(language === "ar" ? "تم النسخ!" : "Copied!");
  };

  const sendViaWhatsApp = (response: string) => {
    const encoded = encodeURIComponent(response);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-warm-cream dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-deep-brown dark:text-white mb-2">
              🤖 AI Response Generator
            </h1>
            <p className="text-tea-brown dark:text-gray-400">
              Generate professional responses to customer inquiries
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-deep-brown dark:text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Admin
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-deep-brown dark:text-white mb-4">
              Customer Message
            </h2>

            {/* Language Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setLanguage("ar")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  language === "ar"
                    ? "bg-tea-green text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-deep-brown dark:text-white"
                }`}
              >
                🇸🇦 Arabic
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  language === "en"
                    ? "bg-tea-green text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-deep-brown dark:text-white"
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            {/* Input */}
            <textarea
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              placeholder={
                language === "ar"
                  ? "الصق رسالة العميل هنا..."
                  : "Paste customer message here..."
              }
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-green bg-white dark:bg-gray-700 text-deep-brown dark:text-white mb-4"
              dir={language === "ar" ? "rtl" : "ltr"}
            />

            {/* Generate Button */}
            <button
              onClick={generateResponse}
              disabled={!customerMessage.trim() || isGenerating}
              className="w-full bg-tea-green hover:bg-tea-green/90 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                  <span>Generate AI Response</span>
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-deep-brown dark:text-white mb-4">
              Generated Response
            </h2>

            {generatedResponse ? (
              <>
                <div
                  className="bg-warm-cream dark:bg-gray-700 rounded-lg p-4 mb-4 min-h-[200px] whitespace-pre-wrap"
                  dir={language === "ar" ? "rtl" : "ltr"}
                >
                  <p className="text-deep-brown dark:text-white">{generatedResponse}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedResponse)}
                    className="flex-1 bg-accent-gold hover:bg-accent-gold/90 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={() => sendViaWhatsApp(generatedResponse)}
                    className="flex-1 bg-tea-green hover:bg-tea-green/90 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-lg">Generated response will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-deep-brown dark:text-white mb-4">
              Recent Responses
            </h2>
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-tea-green">
                      {item.language === "ar" ? "🇸🇦 Arabic" : "🇬🇧 English"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2" dir={item.language === "ar" ? "rtl" : "ltr"}>
                    <strong>Customer:</strong> {item.customerMessage.substring(0, 100)}...
                  </p>
                  <button
                    onClick={() => {
                      setGeneratedResponse(item.generatedResponse);
                      setLanguage(item.language);
                    }}
                    className="text-sm text-tea-green hover:text-tea-green/80 font-semibold"
                  >
                    View Response →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
