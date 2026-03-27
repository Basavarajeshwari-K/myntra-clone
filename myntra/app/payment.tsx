import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const address = params?.address;

  const [method, setMethod] = useState("COD");
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Load cart items from AsyncStorage
  useEffect(() => {
    const loadCart = async () => {
      const data = await AsyncStorage.getItem("cartItems");
      if (data) setCartItems(JSON.parse(data));
    };
    loadCart();
  }, []);

  const goToOrder = async () => {
    if (!address) {
      Alert.alert("Error", "Shipping address not found!");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Error", "Cart is empty!");
      return;
    }

    try {
      const response = await fetch("https://your-backend.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          paymentType: method,
          items: cartItems,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Clear cart
        await AsyncStorage.removeItem("cartItems");

        // Navigate to order confirmation screen
        router.push({
          pathname: "/order-success",
          params: { orderId: result._id },
        });
      } else {
        Alert.alert("Error", result.message || "Failed to place order");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while placing the order");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>

      <TouchableOpacity
        style={[styles.option, method === "COD" && styles.selectedOption]}
        onPress={() => setMethod("COD")}
      >
        <Text style={styles.text}>Cash on Delivery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, method === "UPI" && styles.selectedOption]}
        onPress={() => setMethod("UPI")}
      >
        <Text style={styles.text}>UPI Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, method === "CARD" && styles.selectedOption]}
        onPress={() => setMethod("CARD")}
      >
        <Text style={styles.text}>Credit / Debit Card</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={goToOrder}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  option: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  selectedOption: {
    borderColor: "#ff3e6c",
    backgroundColor: "#ffe6f0",
  },
  text: { fontSize: 16 },
  button: {
    backgroundColor: "#ff3e6c",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
});
