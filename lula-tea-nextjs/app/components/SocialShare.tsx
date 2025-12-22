"use client";

import { motion } from "framer-motion";
import { Share2, Twitter, Facebook, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
}

export default function SocialShare({ 
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "Lula Tea - Premium Saudi Tea Blend",
  description = "Experience the finest tea blend from Saudi Arabia"
}: SocialShareProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { language } = useLanguage();

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " - " + url)}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    alert(language === "ar" ? "تم نسخ الرابط!" : "Link copied!");
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNativeShare}
        className="flex items-center gap-2 bg-tea-green/10 hover:bg-tea-green/20 text-tea-green px-4 py-2 rounded-full font-semibold transition-all"
      >
        <Share2 className="w-4 h-4" />
        <span>{language === "ar" ? "شارك" : "Share"}</span>
      </motion.button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 bg-white rounded-lg shadow-xl p-4 z-50 min-w-[200px]"
        >
          <div className="space-y-2">
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 hover:bg-green-50 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-tea-brown">WhatsApp</span>
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-tea-brown">Facebook</span>
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 hover:bg-sky-50 rounded-lg transition-colors"
            >
              <Twitter className="w-5 h-5 text-sky-600" />
              <span className="text-tea-brown">Twitter</span>
            </a>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
              <span className="text-tea-brown">
                {language === "ar" ? "نسخ الرابط" : "Copy Link"}
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
