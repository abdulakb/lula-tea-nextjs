"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { trackAddToCart } from "@/lib/appInsights";

export interface CartItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("lula-tea-cart");
    if (stored) {
      try {
        const parsedItems = JSON.parse(stored);
        // Validate the data structure
        if (Array.isArray(parsedItems)) {
          setItems(parsedItems);
          console.log(`✅ Cart restored: ${parsedItems.length} unique items`);
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
        localStorage.removeItem("lula-tea-cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes (after mount)
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("lula-tea-cart", JSON.stringify(items));
        console.log(`💾 Cart saved: ${items.length} unique items, ${items.reduce((sum, item) => sum + item.quantity, 0)} total items`);
      } catch (e) {
        console.error("Failed to save cart to localStorage:", e);
      }
    }
  }, [items, mounted]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.id === item.id);
      if (existing) {
        return current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...current, { ...item, quantity }];
    });
    
    // Track add to cart event
    trackAddToCart(item.id, quantity, item.price);
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
