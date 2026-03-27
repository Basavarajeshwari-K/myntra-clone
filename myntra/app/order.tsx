import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ToastAndroid,
  Platform,
} from "react-native";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Notifications from "expo-notifications";

const Order = () => {
  const { bagItems, clearCart } = useCart();
  const { isDark } = useTheme();
  const router = useRouter();

  const params = useLocalSearchParams();
  const address = params?.address ? JSON.parse(params.address as string) : null;

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  useEffect(() => {
  const requestPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      await Notifications.requestPermissionsAsync();
    }
  };

  requestPermission();

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
    });
  }

  // Promotion notification
  setTimeout(() => {
    showLocalNotification(
      "Special Offer 🔥",
      "Flat 40% OFF on Fashion! Shop now before the sale ends."
    );
  }, 5000);

}, []);

  const totalAmount = bagItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const showToast = (message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const API_URL =
    Platform.OS === "android"
      ? "http://192.168.1.2:5000/api/orders"
      : "http://localhost:5000/api/orders";

  // 🔔 LOCAL NOTIFICATION FUNCTION
  const showLocalNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
      },
      trigger: null,
    });
  };

  // ================= PLACE ORDER =================
  const handlePlaceOrder = async () => {
    if (!bagItems.length) {
      showToast("Your cart is empty!");
      return;
    }

    if (!address) {
      showToast("Address not provided!");
      return;
    }

    if (!paymentMethod) {
      showToast("Please select payment method");
      return;
    }

    const formattedProducts = bagItems.map((item: any) => ({
      productId: item.id,
      quantity: item.qty || 1,
    }));

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "rajeshwarik",
          products: formattedProducts,
          totalPrice: totalAmount,
          paymentMethod: paymentMethod,
        }),
      });

      if (response.ok) {
        showToast("Order placed successfully!");

        const orderId = Math.floor(Math.random() * 100000).toString();

        clearCart();

        // ✅ ORDER PLACED NOTIFICATION (LOCAL)
        await showLocalNotification(
          "Order Placed 🎉",
          `Your order #${orderId} of ₹${totalAmount} has been placed successfully!`
        );

        // ✅ ORDER SHIPPED NOTIFICATION AFTER 10s
        setTimeout(async () => {
          await showLocalNotification(
            "Order Shipped 🚚",
            `Your order #${orderId} is on the way!`
          );
        }, 10000);

        router.replace("/");
      } else {
        showToast("Failed to place order!");
      }
    } catch (error) {
      console.error(error);
      showToast("Error placing order!");
    }
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.itemContainer,
        { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.info}>
        <Text style={[styles.brand, { color: isDark ? "#aaa" : "#777" }]}>
          {item.brand}
        </Text>
        <Text style={[styles.name, { color: isDark ? "#fff" : "#000" }]}>
          {item.name}
        </Text>
        <Text style={[styles.size, { color: isDark ? "#fff" : "#000" }]}>
          Size: {item.size}
        </Text>
        <Text style={[styles.price, { color: isDark ? "#fff" : "#000" }]}>
          ₹{item.price} × {item.qty}
        </Text>
      </View>
    </View>
  );

  const PaymentOption = ({ label, value }: any) => (
    <TouchableOpacity
      style={styles.paymentRow}
      onPress={() => setPaymentMethod(value)}
    >
      <View style={styles.radioOuter}>
        {paymentMethod === value && <View style={styles.radioInner} />}
      </View>
      <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 15 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#f5f5f5" },
      ]}
    >
      {bagItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 18 }}>
            Your bag is empty
          </Text>
        </View>
      ) : (
        <>
          {address && (
            <View
              style={[
                styles.addressContainer,
                { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
              ]}
            >
              <Text
                style={[styles.addressTitle, { color: isDark ? "#fff" : "#000" }]}
              >
                Shipping Address
              </Text>
              <Text
                style={[styles.addressText, { color: isDark ? "#ccc" : "#555" }]}
              >
                {address.name}, {address.phone}
              </Text>
              <Text
                style={[styles.addressText, { color: isDark ? "#ccc" : "#555" }]}
              >
                {address.addressLine}, {address.city}, {address.pincode}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.paymentContainer,
              { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
            ]}
          >
            <Text style={[styles.paymentTitle, { color: isDark ? "#fff" : "#000" }]}>
              Payment Method
            </Text>
            <PaymentOption label="Cash on Delivery" value="COD" />
            <PaymentOption label="UPI" value="UPI" />
            <PaymentOption label="Card" value="CARD" />
          </View>

          <FlatList
            data={bagItems}
            keyExtractor={(item) => item.id + item.size}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
          />

          <View
            style={[
              styles.totalContainer,
              { borderTopColor: isDark ? "#333" : "#ccc" },
            ]}
          >
            <Text style={[styles.totalText, { color: isDark ? "#fff" : "#000" }]}>
              Total Amount: ₹{totalAmount}
            </Text>

            <TouchableOpacity
              style={[styles.placeOrderButton, { backgroundColor: "#ff3e6c" }]}
              onPress={handlePlaceOrder}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Place Order
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  itemContainer: { flexDirection: "row", marginBottom: 16, borderRadius: 10, overflow: "hidden" },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 12 },
  brand: { fontSize: 13, marginBottom: 2 },
  name: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  size: { fontSize: 14, marginBottom: 4 },
  price: { fontSize: 14, fontWeight: "bold" },
  totalContainer: { padding: 16, borderTopWidth: 1 },
  totalText: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  placeOrderButton: { paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  addressContainer: { padding: 16, marginHorizontal: 16, marginBottom: 16, borderRadius: 8 },
  addressTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  addressText: { fontSize: 14, marginBottom: 2 },
  paymentContainer: { padding: 16, marginHorizontal: 16, marginBottom: 10, borderRadius: 8 },
  paymentTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  paymentRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#ff3e6c", alignItems: "center", justifyContent: "center", marginRight: 10 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ff3e6c" },
});

export default Order;