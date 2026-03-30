import { useEffect } from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ThemeProvider } from "../context/ThemeContext";
import { WishlistProvider } from "../context/WishlistContext";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const BASE_URL = "https://myntra-clone-wkhe.onrender.com";
const CURRENT_USER_ID = "rajeshwarik";

// Global notification handler (only once in app)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    let notificationListener: any;
    let responseListener: any;

    const setupPushNotifications = async () => {
      try {

        // Android notification channel
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            sound: "default",
          });
        }

        // Request permission
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.log("Push notification permission not granted");
          return;
        }

        // Get Expo push token
        const token = await Notifications.getExpoPushTokenAsync();
        const pushTokenValue = token.data;

        console.log("Push Token:", pushTokenValue);

        // Register token with backend
        await fetch(`${BASE_URL}/api/push/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: CURRENT_USER_ID,
            token: pushTokenValue,
          }),
        });

        // Foreground notification listener
        notificationListener =
          Notifications.addNotificationReceivedListener((notification) => {
            console.log("Foreground notification:", notification);
          });

        // Tap notification listener
        responseListener =
          Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            console.log("User tapped notification:", data);
          });

      } catch (err) {
        console.log("Push setup error:", err);
      }
    };

    setupPushNotifications();

    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}