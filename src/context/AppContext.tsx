import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, WebsiteSettings } from '../types';
import { settingsService } from '../services/settingsService';
import { INITIAL_SETTINGS } from '../data/seedData';

interface AppContextType {
  wishlistIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;

  compareIds: string[];
  addToCompare: (productId: string) => boolean; // returns false if max reached (3)
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;

  settings: WebsiteSettings;
  updateSettings: (newSettings: WebsiteSettings) => Promise<void>;

  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aesthetic_look_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aesthetic_look_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<WebsiteSettings>(INITIAL_SETTINGS);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    localStorage.setItem('aesthetic_look_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem('aesthetic_look_compare', JSON.stringify(compareIds));
  }, [compareIds]);

  const addToWishlist = (productId: string) => {
    setWishlistIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const clearWishlist = () => setWishlistIds([]);

  const addToCompare = (productId: string): boolean => {
    if (compareIds.includes(productId)) return true;
    if (compareIds.length >= 3) {
      return false; // limit reached
    }
    setCompareIds((prev) => [...prev, productId]);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareIds((prev) => prev.filter((id) => id !== productId));
  };

  const isInCompare = (productId: string) => compareIds.includes(productId);

  const clearCompare = () => setCompareIds([]);

  const handleUpdateSettings = async (newSettings: WebsiteSettings) => {
    const updated = await settingsService.updateSettings(newSettings);
    setSettings(updated);
  };

  return (
    <AppContext.Provider
      value={{
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        compareIds,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        settings,
        updateSettings: handleUpdateSettings,
        quickViewProduct,
        setQuickViewProduct,
        searchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
