// src/context/CartContext.tsx - UPDATED VERSION
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '../types/types';
import { cartStorage } from '../storage/cartStorage';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateCartItemQuantity: (productId: number, quantity: number) => Promise<void>; // ✅ ADD THIS
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isStorageFull: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isStorageFull, setIsStorageFull] = useState(false);

  // Load cart items dari storage saat app start
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const savedItems = await cartStorage.getCartItems();
        setCartItems(savedItems);
        console.log('🛒 Cart items loaded from storage:', savedItems.length);
      } catch (error) {
        console.error('❌ Error loading cart items:', error);
      }
    };

    loadCartItems();
  }, []);

  // Helper untuk save ke storage
  const saveToStorage = async (items: CartItem[]) => {
    try {
      setIsStorageFull(false);
      await cartStorage.saveCartItems(items);
    } catch (error: any) {
      if (error.message === 'STORAGE_QUOTA_EXCEEDED' || error.message === 'CART_STORAGE_FULL') {
        console.error('🛒 Storage full - cannot save cart items');
        setIsStorageFull(true);
      } else {
        throw error;
      }
    }
  };

  const addToCart = async (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prevItems, { product, quantity: 1 }];
      }

      saveToStorage(newItems);
      return newItems;
    });
  };

  // ✅ ADD THIS METHOD: Update quantity for specific product
  const updateCartItemQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      
      saveToStorage(newItems);
      return newItems;
    });
  };

  const removeFromCart = async (productId: number) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.product.id !== productId);
      saveToStorage(newItems);
      return newItems;
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    try {
      await cartStorage.clearCart();
    } catch (error) {
      console.error('❌ Error clearing cart from storage:', error);
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.harga * item.quantity), 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity, // ✅ ADD THIS
    clearCart,
    getTotalItems,
    getTotalPrice,
    isStorageFull
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};