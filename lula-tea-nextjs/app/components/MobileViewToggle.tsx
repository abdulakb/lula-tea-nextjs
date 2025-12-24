"use client";

import React, { useState, useEffect } from "react";
import { Grid3x3, List } from "lucide-react";
import { motion } from "framer-motion";

interface ViewToggleProps {
  onViewChange?: (view: "grid" | "list") => void;
  defaultView?: "grid" | "list";
}

const MobileViewToggle: React.FC<ViewToggleProps> = ({ 
  onViewChange,
  defaultView = "grid" 
}) => {
  const [view, setView] = useState<"grid" | "list">(defaultView);

  useEffect(() => {
    // Load saved preference from localStorage
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem("productView") as "grid" | "list" | null;
      if (savedView) {
        setView(savedView);
        onViewChange?.(savedView);
      }
    }
  }, [onViewChange]);

  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
    if (typeof window !== 'undefined') {
      localStorage.setItem("productView", newView);
    }
    onViewChange?.(newView);
  };

  return (
    <div className="md:hidden flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => handleViewChange("grid")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          view === "grid"
            ? "bg-[var(--primary-color)] text-white"
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        <Grid3x3 size={18} />
        <span className="text-sm font-medium">Grid</span>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => handleViewChange("list")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
          view === "list"
            ? "bg-[var(--primary-color)] text-white"
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        <List size={18} />
        <span className="text-sm font-medium">List</span>
      </motion.button>
    </div>
  );
};

export default MobileViewToggle;
