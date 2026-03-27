import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

// Light theme colors
const lightTheme = {
  background: "#ffffff",
  text: "#000000",
  subText: "#666666",
  card: "#f8f8f8",
  border: "#e0e0e0",
};

// Dark theme colors
const darkTheme = {
  background: "#121212",
  text: "#ffffff",
  subText: "#cccccc",
  card: "#1e1e1e",
  border: "#333333",
};

// Centralized theme object
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

type ThemeContextType = {
  isDark: boolean;
  colors: typeof lightTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [userToggled, setUserToggled] = useState(false); // Track if user manually switched theme

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        // Use saved preference if exists
        setIsDark(savedTheme === "dark");
        setUserToggled(true);
      } else {
        // Otherwise, adopt device theme on first launch
        const deviceTheme = Appearance.getColorScheme();
        setIsDark(deviceTheme === "dark");
      }
    };
    loadTheme();

    // Listen for device theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!userToggled) {
        setIsDark(colorScheme === "dark");
      }
    });

    return () => subscription.remove();
  }, [userToggled]);

  // Toggle between light and dark themes manually
  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    setUserToggled(true); // mark that user has chosen manually
    await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors: isDark ? themes.dark : themes.light,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
