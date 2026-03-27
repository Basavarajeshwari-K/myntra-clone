import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: object;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  const { isDark } = useTheme();
  const backgroundColor = isDark ? "#1e1e1e" : "#fff";
  const borderColor = isDark ? "#333" : "#ddd";

  return (
    <View style={[styles.card, { backgroundColor, borderColor }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
