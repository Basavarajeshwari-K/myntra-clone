import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";

import * as Notifications from "expo-notifications";

import { Heart, ShoppingBag } from "lucide-react-native";

import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { registerAndSendPushToken } from "../../utils/notifications";

import bannerImg from "../../assets/images/banner.png";
import menImg from "../../assets/images/men.png";
import womenImg from "../../assets/images/women.png";
import kidsImg from "../../assets/images/kids.png";
import beautyImg from "../../assets/images/beauty.png";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const router = useRouter();
  const { addToBag } = useCart();
  const { isDark, toggleTheme } = useTheme();

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const theme = {
    bg: isDark ? "#000" : "#fff",
    text: isDark ? "#fff" : "#000",
    card: isDark ? "#1a1a1a" : "#f5f5f5",
  };

  const CATEGORY_DATA = [
    { id: 1, name: "Men", image: menImg },
    { id: 2, name: "Women", image: womenImg },
    { id: 3, name: "Kids", image: kidsImg },
    { id: 4, name: "Beauty", image: beautyImg },
  ];

  const DEAL_PRODUCTS = [
    {
      id: "deal1",
      title: "Under ₹599",
      image: "https://images.pexels.com/photos/17901262/pexels-photo-17901262.jpeg",
    },
    {
      id: "deal2",
      title: "40-70% OFF",
      image: "https://images.pexels.com/photos/12738136/pexels-photo-12738136.jpeg",
    },
    {
      id: "deal3",
      title: "Under ₹999",
      image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg",
    },
  ];

  const TRENDING_PRODUCTS = [
    {
      id: "trend1",
      name: "Bodycon Dress",
      brand: "Zara",
      price: 2499,
      image: "https://images.pexels.com/photos/22042371/pexels-photo-22042371.jpeg",
      description: "Elegant bodycon dress for parties.",
      sizes: ["S", "M", "L", "XL"],
    },
    {
      id: "trend2",
      name: "Jeans",
      brand: "Levi's",
      price: 1999,
      image: "https://images.pexels.com/photos/30710244/pexels-photo-30710244.jpeg",
      description: "Slim fit denim jeans for daily wear.",
      sizes: ["28", "30", "32", "34"],
    },
  ];

  useEffect(() => {
    const loadWishlist = async () => {
      const stored = await AsyncStorage.getItem("wishlist");
      if (stored) setWishlist(JSON.parse(stored));
    };
    loadWishlist();
  }, []);

  useEffect(() => {
    const loadRecent = async () => {
      const recent = await getRecentlyViewed();
      setRecentProducts(recent);
    };
    loadRecent();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") {
      try {
        registerAndSendPushToken();
      } catch (e) {
        console.warn("Push token registration skipped", e);
      }

      notificationListener.current =
        Notifications.addNotificationReceivedListener(notification => {
          console.log("Notification received:", notification);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(response => {
          console.log("Notification clicked:", response);
        });
    }

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const toggleWishlist = async (id: string) => {
    let updated: string[] = [];
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
    } else {
      updated = [...wishlist, id];
    }
    setWishlist(updated);
    await AsyncStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const renderProduct = (item: any) => {
    return (
      <TouchableOpacity
        key={item.id || Math.random()}
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() =>
          router.push({
            pathname: "/product",
            params: { product: JSON.stringify(item) },
          })
        }
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.cardContent}>
          <Text style={[styles.brand, { color: theme.text }]}>{item.brand}</Text>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.price, { color: theme.text }]}>₹{item.price}</Text>
          {/* Show description & sizes in trending product */}
          {item.description && <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>}
          {item.sizes && (
            <Text style={[styles.sizes, { color: theme.text }]}>
              Sizes: {item.sizes.join(", ")}
            </Text>
          )}
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => toggleWishlist(item.id)}>
              <Heart size={20} color={wishlist.includes(item.id) ? "red" : theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addToBag(item)}>
              <ShoppingBag size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={{ backgroundColor: theme.bg }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>MYNTRA</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      <Image source={bannerImg} style={styles.banner} />

      {/* SHOP BY CATEGORY */}
      <View style={styles.categoryHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          SHOP BY CATEGORY
        </Text>
        <TouchableOpacity onPress={() => router.push("/categories")}>
          <Text style={styles.viewAll}>VIEW ALL &gt;</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      >
        {CATEGORY_DATA.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryCard}
            onPress={() => router.push({ pathname: "/category", params: { name: cat.name } })}
          >
            <Image source={cat.image} style={styles.categoryImage} />
            <Text style={{ color: theme.text }}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* RECENTLY VIEWED */}
      {recentProducts.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            RECENTLY VIEWED
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentProducts.map(renderProduct)}
          </ScrollView>
        </>
      )}

      {/* DEALS OF THE DAY */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        DEALS OF THE DAY
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {DEAL_PRODUCTS.map(item => (
          <TouchableOpacity key={item.id || Math.random()} style={styles.dealCard}>
            <Image source={{ uri: item.image }} style={styles.dealImage} />
            <View style={styles.dealOverlay}>
              <Text style={styles.dealText}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* TRENDING NOW */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        TRENDING NOW
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {TRENDING_PRODUCTS.map(renderProduct)}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  banner: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
    marginLeft: 16,
  },

  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 16,
  },

  viewAll: {
    color: "#ff3f6c",
    fontWeight: "bold",
    fontSize: 14,
  },

  categoryCard: {
    alignItems: "center",
    marginHorizontal: 12,
  },

  categoryImage: {
    width: 75,
    height: 75,
    borderRadius: 40,
    marginBottom: 6,
  },

  dealCard: {
    width: 260,
    height: 150,
    marginLeft: 16,
    borderRadius: 14,
    overflow: "hidden",
  },

  dealImage: {
    width: "100%",
    height: "100%",
  },

  dealOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
  },

  dealText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  card: {
    width: 150,
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 120,
  },

  cardContent: {
    padding: 8,
  },

  brand: {
    fontSize: 12,
    fontWeight: "bold",
  },

  name: {
    fontSize: 14,
  },

  price: {
    fontSize: 14,
    fontWeight: "bold",
  },

  description: {
    fontSize: 12,
    marginTop: 4,
  },

  sizes: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});