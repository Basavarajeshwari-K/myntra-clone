import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: object;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, loading = false, disabled = false, style }) => {
  const { isDark } = useTheme();

  const backgroundColor = isDark ? "#1e1e1e" : "#007bff";
  const textColor = isDark ? "#fff" : "#fff";
  const disabledColor = isDark ? "#555" : "#aaa";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: disabled ? disabledColor : backgroundColor },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
