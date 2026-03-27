import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description?: string;
  sizes?: string[];
  offerPrice?: number;
}

type WishlistContextType = {
  wishlist: WishlistItem[];
  toggleWishlist: (item: any) => void;
  setWishlist: (items: WishlistItem[]) => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "@my_app_wishlist";

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlistState] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setWishlistState(JSON.parse(stored));
        }
      } catch (e) {
        console.log("Failed to load wishlist", e);
      }
    };

    loadWishlist();
  }, []);

  useEffect(() => {
    const saveWishlist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
      } catch (e) {
        console.log("Failed to save wishlist", e);
      }
    };

    saveWishlist();
  }, [wishlist]);

  // ✅ IMPORTANT: store full product
  const toggleWishlist = (item: any) => {
    const normalizedItem: WishlistItem = {
      id: item.id || item._id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      image: item.image,
      description: item.description,
      sizes: item.sizes,
      offerPrice: item.offerPrice
    };

    setWishlistState(prev => {
      const exists = prev.some(i => i.id === normalizedItem.id);
      if (exists) {
        return prev.filter(i => i.id !== normalizedItem.id);
      }
      return [...prev, normalizedItem];
    });
  };

  const setWishlist = (items: WishlistItem[]) => {
    setWishlistState(items);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, setWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
};