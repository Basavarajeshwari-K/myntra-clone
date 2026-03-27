import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";

export default function Bag() {
  const router = useRouter();
  const { bagItems, setBagItems, updateQty, removeFromBag } = useCart(); // added setBagItems
  const { isDark } = useTheme();

  const theme = {
    bg: isDark ? "#121212" : "#fff",
    text: isDark ? "#fff" : "#000",
    card: isDark ? "#1a1a1a" : "#f5f5f5",
    border: isDark ? "#333" : "#ddd",
    secondaryText: isDark ? "#888" : "#777",
    pink: "#ff3e6c",
  };

  const total = bagItems.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0
  );

  // Load saved cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem("@my_app_bag");
        if (savedCart) {
          setBagItems(JSON.parse(savedCart));
        }
      } catch (e) {
        console.log("Failed to load cart", e);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem("@my_app_bag", JSON.stringify(bagItems));
      } catch (e) {
        console.log("Failed to save cart", e);
      }
    };
    saveCart();
  }, [bagItems]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.header, { color: theme.text }]}>Shopping Bag</Text>

      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {bagItems.length === 0 ? (
          <Text style={{ color: theme.text, textAlign: "center", marginTop: 50 }}>
            Your bag is empty
          </Text>
        ) : (
          bagItems.map(item => (
            <View key={item.id + item.size} style={[styles.card, { backgroundColor: theme.card }]}>
              <Image source={{ uri: item.image }} style={styles.image} />

              <View style={styles.info}>
                <Text style={{ color: theme.secondaryText, fontSize: 12 }}>{item.brand}</Text>
                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={{ color: theme.secondaryText, fontSize: 12 }}>Size: {item.size}</Text>
                <Text style={[styles.price, { color: theme.text }]}>₹{item.price}</Text>

                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() => updateQty(item.id, item.size!, Math.max(1, (item.qty || 1) - 1))}
                  >
                    <Minus size={16} color={theme.text} />
                  </TouchableOpacity>

                  <Text style={{ marginHorizontal: 10, color: theme.text }}>{item.qty}</Text>

                  <TouchableOpacity
                    onPress={() => updateQty(item.id, item.size!, (item.qty || 1) + 1)}
                  >
                    <Plus size={16} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={() => removeFromBag(item.id, item.size!)}>
                <Trash2 size={18} color={theme.pink} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {bagItems.length > 0 && (
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <Text style={[styles.total, { color: theme.text }]}>Total: ₹{total}</Text>
          <TouchableOpacity
            style={[styles.orderBtn, { backgroundColor: theme.pink }]}
            onPress={() => router.push("/checkout")}
          >
            <Text style={styles.orderText}>PLACE ORDER</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 22, fontWeight: "bold", padding: 16 },
  card: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  image: { width: 90, height: 110, borderRadius: 6 },
  info: { flex: 1, marginLeft: 10 },
  name: { fontSize: 14, fontWeight: "500" },
  price: { fontSize: 14, fontWeight: "bold" },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  footer: { padding: 16, borderTopWidth: 1 },
  total: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  orderBtn: { padding: 14, borderRadius: 6, alignItems: "center" },
  orderText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});  
