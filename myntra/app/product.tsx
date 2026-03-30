import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";

import * as Notifications from "expo-notifications";
import { Heart } from "lucide-react-native";
import { Card } from "../components/ui/Card";
import { CartItem, useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useWishlist } from "../context/WishlistContext";
import { saveRecentlyViewed } from "../utils/recentlyViewed";
import { formatProduct, FormattedProduct } from "../utils/formatProduct";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  brand: string;
  price: number;
  offer?: number;
  image?: string;
  images?: string[];
  description?: string;
  sizes?: string[];
}

const BASE_URL = "https://myntra-clone-wkhe.onrender.com"
const CURRENT_USER_ID = "rajeshwarik";

// ✅ FULLY FIXED IMAGE FUNCTION
const getImageUrl = (image?: string) => {
  if (!image) return "https://via.placeholder.com/140";

  // Remove duplicate 'uploads/' and extra slashes
  let cleaned = image
    .replace(/\\/g, "/")                 // backslashes → forward slashes
    .replace(/\/+/g, "/")                // multiple slashes → single slash
    .replace(/uploads\/uploads\//g, "uploads/") // remove duplicate uploads/
    .replace(/^\/+/, "");                // remove starting slash

  // If image is already a full URL
  if (image.startsWith("http")) return cleaned.startsWith("http") ? cleaned : `${BASE_URL}/${cleaned}`;

  // Otherwise, construct full URL
  return `${BASE_URL}/${cleaned}`;
};

async function sendCartReminder(userId: string, cartItems: CartItem[]) {
  try {
    const response = await fetch(`${BASE_URL}/api/push/cart-reminder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cartItems }),
    });
    const data = await response.json();
    if (data.success) console.log("Cart reminder scheduled via backend");
    else console.error("Error scheduling cart reminder:", data.error);
  } catch (err) {
    console.error("Cart reminder fetch error:", err);
  }
}

async function scheduleLocalCartReminder(cartItems: CartItem[]) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Still thinking? 🛍️",
        body: `You left ${cartItems[0]?.name} in your cart. Complete your purchase now!`,
        sound: true,
      },
      trigger: {
        seconds: 60,
        channelId: "default",
      },
    });
  } catch (error) {
    console.log("Local reminder scheduling failed:", error);
  }
}

export default function ProductDetail() {
  const { product, productData } = useLocalSearchParams<{ product?: string; productData?: string }>();
  const parsedProduct: Product = productData
    ? JSON.parse(decodeURIComponent(productData))
    : product
    ? JSON.parse(decodeURIComponent(product))
    : ({} as Product);

  const safeProduct: FormattedProduct = formatProduct(parsedProduct) || ({} as FormattedProduct);

  const router = useRouter();
  const { bagItems, setBagItems } = useCart();
  const { colors } = useTheme();
  const { wishlist, toggleWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<FormattedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const productId = safeProduct._id || safeProduct.id;
  const finalPrice = safeProduct.price;
  const isFavorite = wishlist.some(item => item.id === productId);

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert("Notification received!", notification.request.content.body || "");
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!productId) return;
    saveRecentlyViewed(safeProduct);
    fetchRecommendedProducts();
    fetchProductWithUserId();
  }, [productId]);

  const handleAddToBag = async () => {
  if (!selectedSize) {
    Alert.alert("Select Size", "Please select a size before adding to bag");
    return;
  }

  const item: CartItem = {
    id: productId!,
    name: safeProduct.name,
    brand: safeProduct.brand,
    price: finalPrice,
    image: safeProduct.image || "",
    size: selectedSize,
    qty: 1,
  };

  const index = bagItems.findIndex(b => b.id === item.id && b.size === item.size);
  const updatedBag = [...bagItems];

  if (index >= 0) updatedBag[index].qty += 1;
  else updatedBag.push(item);

  setBagItems(updatedBag);
  await AsyncStorage.setItem("@my_app_bag", JSON.stringify(updatedBag));

  // 🔔 LOCAL PHONE NOTIFICATION
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Added to Bag 🛍️",
        body: `${safeProduct.name} (${selectedSize}) added to your bag`,
        sound: true,
      },
      trigger: null,
    });
  } catch (err) {
    console.log("Notification error:", err);
  }

  // 🔔 60 SECOND REMINDER NOTIFICATION
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Complete Your Purchase ⏰",
        body: `${safeProduct.name} is waiting in your bag. Checkout before it sells out!`,
        sound: true,
      },
      trigger: {
        seconds: 60,
        channelId: "default",
      },
    });
  } catch (err) {
    console.log("Reminder notification error:", err);
  }

  Alert.alert("Added to Bag", `${safeProduct.name} (${selectedSize})`);
  setTimeout(() => router.push("/checkout"), 400);
};

  const fetchProductWithUserId = async () => {
    if (!productId) return;
    try {
      await fetch(`${BASE_URL}/api/products/${productId}?userId=${CURRENT_USER_ID}`);
    } catch (error) {
      console.log("Failed to update product history:", error);
    }
  };

  const fetchRecommendedProducts = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/products/recommendations/${productId}?userId=${CURRENT_USER_ID}`);
      const data = await res.json();
      const formatted = Array.isArray(data)
        ? data.map(formatProduct).filter(Boolean) as FormattedProduct[]
        : [];
      setRecommended(formatted);
    } catch (error) {
      console.log("Failed to fetch recommended products:", error);
    } finally {
      setLoading(false);
    }
  };

const renderRecommendedItem = ({ item }: { item: FormattedProduct }) => {
  console.log("Recommended product:", item.name, item.image);

  const sizes =
    item.sizes && item.sizes.length > 0
      ? item.sizes.join(", ")
      : "N/A";

  return (
    <TouchableOpacity
      style={styles.recommendedItem}
      onPress={() =>
        router.push(`/product?product=${encodeURIComponent(JSON.stringify(item))}`)
      }
    >
      <Image
        source={{ uri: getImageUrl(item.image) }}
        style={styles.recommendedImage}
      />

      <Text
        style={[styles.recommendedName, { color: colors.text }]}
        numberOfLines={1}
      >
        {item.name}
      </Text>

      <Text style={styles.recommendedPrice}>₹{item.price}</Text>

      <Text style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
        Sizes: {sizes}
      </Text>
    </TouchableOpacity>
  );
};

  if (!safeProduct || !productId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Product not found</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: getImageUrl(safeProduct.image) }} style={styles.image} />
        <TouchableOpacity
          style={styles.wishlistIcon}
          onPress={() =>
            toggleWishlist({
              id: productId!,
              name: safeProduct.name,
              brand: safeProduct.brand,
              price: finalPrice,
              image: safeProduct.image || "",
              offer: safeProduct.offer,
              description: safeProduct.description,
              sizes: safeProduct.sizes,
            })
          }
        >
          <Heart size={26} color={isFavorite ? "red" : "#fff"} fill={isFavorite ? "red" : "transparent"} />
        </TouchableOpacity>
      </View>

      <Card style={styles.infoCard}>
        <Text style={[styles.brandText, { color: colors.subText }]}>{safeProduct.brand}</Text>
        <Text style={[styles.productName, { color: colors.text }]}>{safeProduct.name}</Text>
        <Text style={[styles.description, { color: colors.subText }]}>{safeProduct.description}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.finalPrice}>₹{finalPrice}</Text>
          {safeProduct.offer && <Text style={styles.offerText}>{safeProduct.offer}% OFF</Text>}
        </View>

        <Text style={styles.selectSizeText}>Select Size</Text>
        <View style={styles.sizeContainer}>
          {safeProduct.sizes?.map(size => (
            <TouchableOpacity
              key={size}
              style={[styles.sizeButton, selectedSize === size && styles.selectedSize]}
              onPress={() => setSelectedSize(size)}
            >
              <Text style={{ color: selectedSize === size ? "#fff" : "#000", fontWeight: "600" }}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.addToBagButton, { opacity: selectedSize ? 1 : 0.6 }]} onPress={handleAddToBag}>
          <Text style={styles.addToBagText}>Add to Bag 🛒</Text>
        </TouchableOpacity>
      </Card>

      {recommended.length > 0 && (
        <View style={{ marginTop: 20, paddingLeft: 16 }}>
          <Text style={[styles.recommendedTitle, { color: colors.text }]}>You may also like</Text>
          <FlatList
            data={recommended}
            keyExtractor={(item, index) => item._id || item.id || index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderRecommendedItem}
            contentContainerStyle={{ paddingRight: 16, marginTop: 10 }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageWrapper: { position: "relative" },
  image: { width: "100%", height: 420 },
  wishlistIcon: { position: "absolute", top: 20, right: 20, backgroundColor: "rgba(0,0,0,0.4)", padding: 8, borderRadius: 30 },
  infoCard: { margin: 16, padding: 16, borderRadius: 16 },
  brandText: { fontSize: 14 },
  productName: { fontSize: 22, fontWeight: "700", marginVertical: 6 },
  description: { fontSize: 14, marginBottom: 12 },
  priceRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  finalPrice: { fontSize: 22, fontWeight: "700" },
  offerText: { color: "#d32f2f", fontWeight: "700" },
  selectSizeText: { marginBottom: 8, fontWeight: "600" },
  sizeContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  sizeButton: { borderWidth: 1, borderColor: "#000", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginRight: 10, marginBottom: 10 },
  selectedSize: { backgroundColor: "#e91e63", borderColor: "#e91e63" },
  addToBagButton: { backgroundColor: "#e91e63", height: 56, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  addToBagText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  recommendedTitle: { fontSize: 18, fontWeight: "700" },
  recommendedItem: { width: 140, marginRight: 12, borderRadius: 12, overflow: "hidden", backgroundColor: "#f5f5f5", paddingBottom: 8 },
  recommendedImage: { width: "100%", height: 120, resizeMode: "cover" },
  recommendedName: { marginTop: 6, fontSize: 14 },
  recommendedPrice: { fontSize: 14, fontWeight: "700", marginTop: 2 },
});