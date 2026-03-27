import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";

const Checkout = () => {
  const { bagItems = [], savedItems = [], clearCart, saveForLater, moveToBag } = useCart();
  const { isDark } = useTheme();
  const router = useRouter();

  const theme = {
    background: isDark ? "#121212" : "#fff",
    card: isDark ? "#1a1a1a" : "#f5f5f5",
    savedCard: isDark ? "#1f1f1f" : "#eaeaea",
    text: isDark ? "#fff" : "#000",
    subText: isDark ? "#888" : "#666",
    border: isDark ? "#333" : "#ddd",
    pink: "#ff3e6c",
  };

  const showToast = (message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleClearCart = () => {
    clearCart();
    showToast("Cart has been cleared!");
  };

  const handleSaveForLater = (item: any) => {
    saveForLater(item);
    showToast(`${item.name} saved for later!`);
  };

  const handleMoveToBag = (item: any) => {
    moveToBag(item);
    showToast(`${item.name} moved to bag!`);
  };

  // ------------------- Updated getTotal -------------------
  const getTotal = () =>
    bagItems
      .filter(item => item.status ? item.status !== "saveForLater" : true)
      .reduce((total, item) => total + (item.price || 0) * (item.qty || 0), 0);

  const handleProceedToAddress = () => {
    const activeItems = bagItems.filter(item => item.status ? item.status !== "saveForLater" : true);

    if (activeItems.length === 0) {
      showToast("Your cart is empty!");
      return;
    }

    router.push({
      pathname: "/address",
      params: {
        total: getTotal().toString(),
        items: JSON.stringify(activeItems || []),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }}>
        <Text style={[styles.title, { color: theme.text }]}>Your Bag</Text>

        {bagItems.filter(item => item.status ? item.status !== "saveForLater" : true).length === 0 ? (
          <Text style={{ color: theme.subText, textAlign: "center", marginTop: 20 }}>
            Your cart is empty.
          </Text>
        ) : (
          bagItems
            .filter(item => item.status ? item.status !== "saveForLater" : true)
            .map((item) => (
              <View
                key={item.id + item.size}
                style={[
                  styles.itemContainer,
                  { borderColor: theme.border, backgroundColor: theme.card },
                ]}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, { backgroundColor: theme.savedCard }]} />
                )}

                <View style={styles.itemDetails}>
                  <Text style={{ color: theme.text, fontWeight: "600" }}>{item.name}</Text>
                  <Text style={{ color: theme.subText }}>
                    Size: {item.size} | Qty: {item.qty || 1}
                  </Text>
                  <Text style={{ color: theme.text, fontWeight: "700" }}>
                    ₹{((item.price || 0) * (item.qty || 0)).toFixed(2)}
                  </Text>

                  <TouchableOpacity onPress={() => handleSaveForLater(item)} style={{ marginTop: 6 }}>
                    <Text style={{ color: theme.pink, fontWeight: "600" }}>Save for later</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
        )}

        {bagItems.filter(item => item.status ? item.status !== "saveForLater" : true).length > 0 && (
          <>
            <Text style={[styles.totalText, { color: theme.text }]}>
              Total: ₹{getTotal().toFixed(2)}
            </Text>

            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: theme.pink }]}
              onPress={handleClearCart}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Clear Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.proceedButton, { backgroundColor: theme.pink, marginTop: 16 }]}
              onPress={handleProceedToAddress}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Proceed to Address
              </Text>
            </TouchableOpacity>
          </>
        )}

        {savedItems.length > 0 && (
          <>
            <Text style={[styles.title, { color: theme.text, marginTop: 30 }]}>Saved for Later</Text>

            {savedItems.map((item) => (
              <View
                key={item.id + item.size}
                style={[
                  styles.itemContainer,
                  { borderColor: theme.border, backgroundColor: theme.savedCard },
                ]}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, { backgroundColor: theme.card }]} />
                )}

                <View style={styles.itemDetails}>
                  <Text style={{ color: theme.text, fontWeight: "600" }}>{item.name}</Text>
                  <Text style={{ color: theme.subText }}>Size: {item.size}</Text>
                  <Text style={{ color: theme.text, fontWeight: "700" }}>₹{item.price.toFixed(2)}</Text>

                  <TouchableOpacity onPress={() => handleMoveToBag(item)} style={{ marginTop: 6 }}>
                    <Text style={{ color: theme.pink, fontWeight: "600" }}>Move to bag</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: "700", marginVertical: 16 },
  itemContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  itemImage: { width: 80, height: 80, borderRadius: 6, marginRight: 12 },
  itemDetails: { flex: 1, justifyContent: "space-between" },
  totalText: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "right",
    marginVertical: 16,
  },
  clearButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  proceedButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default Checkout;     