import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "expo-router";

const Address = () => {
  const { isDark } = useTheme();
  const router = useRouter();

  const theme = {
    background: isDark ? "#121212" : "#fff",
    card: isDark ? "#1a1a1a" : "#f5f5f5",
    text: isDark ? "#fff" : "#000",
    subText: isDark ? "#888" : "#666",
    border: isDark ? "#333" : "#ddd",
    pink: "#ff3e6c",
  };

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // ⭐ NEW STATE (payment)
  const [paymentType, setPaymentType] = useState("");

  const showToast = (message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleContinue = () => {
    if (!name || !phone || !addressLine || !city || !pincode) {
      showToast("Please fill all fields");
      return;
    }

    if (!paymentType) {
      showToast("Please select payment method");
      return;
    }

    const addressData = { name, phone, addressLine, city, pincode };

    router.push({
      pathname: "/order",
      params: {
        address: JSON.stringify(addressData),
        paymentType: paymentType, // ⭐ sending payment
      },
    });
  };

  const PaymentOption = ({ label }: { label: string }) => (
    <TouchableOpacity
      style={[
        styles.paymentOption,
        {
          borderColor: paymentType === label ? theme.pink : theme.border,
          backgroundColor: paymentType === label ? "#ffe6ee" : "transparent",
        },
      ]}
      onPress={() => setPaymentType(label)}
    >
      <Text
        style={{
          color: paymentType === label ? theme.pink : theme.text,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        <Text style={[styles.title, { color: theme.text }]}>Shipping Address</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.subText}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Phone</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor={theme.subText}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Address</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={addressLine}
            onChangeText={setAddressLine}
            placeholder="Street, Building, etc."
            placeholderTextColor={theme.subText}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>City</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor={theme.subText}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Pincode</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            value={pincode}
            onChangeText={setPincode}
            placeholder="Pin code"
            placeholderTextColor={theme.subText}
            keyboardType="number-pad"
          />
        </View>

        {/* ⭐ PAYMENT SECTION */}
        <Text style={[styles.title, { color: theme.text, fontSize: 18, marginTop: 10 }]}>
          Payment Method
        </Text>

        <PaymentOption label="Cash on Delivery" />
        <PaymentOption label="UPI" />
        <PaymentOption label="Card" />

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: theme.pink }]}
          onPress={handleContinue}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            Continue to Order Summary
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: "700", marginVertical: 16 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  continueButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  paymentOption: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default Address;
