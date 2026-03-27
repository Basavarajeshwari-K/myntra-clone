import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

const BACKEND_URL = "http://192.168.1.2:5000"; // replace with your backend IP
const CURRENT_USER_ID = "rajeshwarik"; // replace with your dynamic logged-in user ID if needed

// 🔔 Register push token safely
export async function registerAndSendPushToken() {
  if (!Device.isDevice || Platform.OS === "web") {
    console.log("Push Notifications require a physical device and native platform");
    return;
  }

  try {
    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permission not granted");
      return;
    }

    // Get Expo push token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Push Token:", token);

    // Send token to backend safely
    try {
      const response = await fetch(`${BACKEND_URL}/push/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userId: CURRENT_USER_ID }),
      });

      // Only parse JSON if backend returns JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Backend register response:", data);
      } else {
        console.log("Backend returned non-JSON response, skipping parse");
      }
    } catch (err) {
      console.warn("Failed to register token to backend, skipping parse:", err);
    }

    // Android notification channel setup
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } catch (err) {
    console.error("Error registering push token:", err);
  }
}

// 🔔 Send push notification via backend
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string
) {
  try {
    await fetch(`${BACKEND_URL}/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, body }),
    });
    console.log(`Notification sent to ${userId}: ${title}`);
  } catch (err) {
    console.warn("Failed to send push notification:", err);
  }
}

// ✅ Alias for _layout.tsx compatibility
export async function registerForPushNotificationsAsync() {
  return await registerAndSendPushToken();
}