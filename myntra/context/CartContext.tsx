import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { sendPushNotification } from "../utils/notifications"; // ✅ added

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  size: string;
  qty: number;
}

interface CartContextType {
  bagItems: CartItem[];
  savedItems: CartItem[];
  setBagItems: (items: CartItem[]) => void;
  addToBag: (item: CartItem) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  removeFromBag: (id: string, size: string) => void;
  clearCart: () => void;
  saveForLater: (item: CartItem) => void;
  moveToBag: (item: CartItem) => void;
}

const CartContext = createContext<CartContextType>({
  bagItems: [],
  savedItems: [],
  setBagItems: () => {},
  addToBag: () => {},
  updateQty: () => {},
  removeFromBag: () => {},
  clearCart: () => {},
  saveForLater: () => {},
  moveToBag: () => {},
});

const BAG_KEY = "@my_app_bag";
const SAVED_KEY = "@my_app_saved";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [bagItems, setBagItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);

  // Load bag & saved items
  useEffect(() => {
    const loadData = async () => {
      try {
        const bag = await AsyncStorage.getItem(BAG_KEY);
        const saved = await AsyncStorage.getItem(SAVED_KEY);

        if (bag) setBagItems(JSON.parse(bag));
        if (saved) setSavedItems(JSON.parse(saved));
      } catch (e) {
        console.log("Failed to load cart data", e);
      }
    };
    loadData();
  }, []);

  // Persist bag items
  useEffect(() => {
    AsyncStorage.setItem(BAG_KEY, JSON.stringify(bagItems));
  }, [bagItems]);

  // Persist saved items
  useEffect(() => {
    AsyncStorage.setItem(SAVED_KEY, JSON.stringify(savedItems));
  }, [savedItems]);

  // 🔹 Updated addToBag with push notifications
  const addToBag = (item: CartItem) => {
    setBagItems(prev => {
      const existingIndex = prev.findIndex(
        b => b.id === item.id && b.size === item.size
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].qty += item.qty;

        // ✅ Send push notification when item quantity updated
        sendPushNotification(
          "rajeshwarik",
          "Item Added",
          `${item.name} quantity updated in your bag`
        );

        return updated;
      }

      // ✅ Send push notification when new item added
      sendPushNotification(
        "rajeshwarik",
        "Item Added",
        `${item.name} was added to your bag`
      );

      return [...prev, item];
    });
  };

  const updateQty = (id: string, size: string, qty: number) => {
    setBagItems(prev =>
      prev.map(item =>
        item.id === id && item.size === size
          ? { ...item, qty }
          : item
      )
    );
  };

  const removeFromBag = (id: string, size: string) => {
    setBagItems(prev =>
      prev.filter(item => !(item.id === id && item.size === size))
    );
  };

  const clearCart = () => {
    setBagItems([]);
  };

  const saveForLater = (item: CartItem) => {
    setBagItems(prev =>
      prev.filter(i => !(i.id === item.id && i.size === item.size))
    );

    setSavedItems(prev => {
      const exists = prev.find(
        i => i.id === item.id && i.size === item.size
      );
      if (exists) return prev;
      return [{ ...item }, ...prev];
    });
  };

  const moveToBag = (item: CartItem) => {
    setSavedItems(prev =>
      prev.filter(i => !(i.id === item.id && i.size === item.size))
    );

    setBagItems(prev => {
      const exists = prev.find(
        i => i.id === item.id && i.size === item.size
      );
      if (exists) return prev;
      return [...prev, { ...item }];
    });
  };

  return (
    <CartContext.Provider
      value={{
        bagItems,
        savedItems,
        setBagItems,
        addToBag,
        updateQty,
        removeFromBag,
        clearCart,
        saveForLater,
        moveToBag,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);