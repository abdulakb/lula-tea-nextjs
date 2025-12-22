"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

const MobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      label: "Products",
      icon: ShoppingBag,
      path: "/#products",
    },
    {
      label: "Cart",
      icon: ShoppingCart,
      path: "/cart",
      badge: cartItemsCount,
    },
    {
      label: "Account",
      icon: User,
      path: "/account",
    },
  ];

  const handleNavClick = (path: string) => {
    if (path.includes("#")) {
      const [pagePath, hash] = path.split("#");
      if (pathname === pagePath || pagePath === "/") {
        // Already on the page, just scroll to section
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to page with hash
        router.push(path);
      }
    } else {
      router.push(path);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    if (path.includes("#")) {
      const [pagePath] = path.split("#");
      return pathname === pagePath || pathname === "/";
    }
    return pathname === path;
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden shadow-lg"
      >
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.path)}
                className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
                  active
                    ? "text-[var(--primary-color)] dark:text-[var(--primary-light)]"
                    : "text-gray-600 dark:text-gray-400 hover:text-[var(--primary-color)] dark:hover:text-[var(--primary-light)]"
                }`}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  
                  {/* Cart Badge */}
                  {item.label === "Cart" && cartItemsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {cartItemsCount > 99 ? "99+" : cartItemsCount}
                    </motion.span>
                  )}
                </div>
                
                <span className={`text-xs font-medium ${active ? "font-semibold" : ""}`}>
                  {item.label}
                </span>

                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[var(--primary-color)] dark:bg-[var(--primary-light)] rounded-t-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
};

export default MobileBottomNav;
