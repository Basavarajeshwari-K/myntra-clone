import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { isDark, colors, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>
          Dark Mode
        </Text>

        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: "#ff3f6c" }}
          thumbColor="#ffffff"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
  },
});
