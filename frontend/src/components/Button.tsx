import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../utils/theme";

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  size = "normal"
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "normal" | "small";
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === "small" ? styles.small : styles.normal,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && { opacity: 0.9 }
      ]}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator size="small" color={theme.colors.text} /> : null}
        <Text style={[styles.text, size === "small" && styles.textSmall]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  normal: {
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm
  },
  primary: { backgroundColor: theme.colors.primary, borderColor: "transparent" },
  secondary: { backgroundColor: theme.colors.card },
  danger: { backgroundColor: theme.colors.danger, borderColor: "transparent" },
  disabled: { opacity: 0.55 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  text: { color: theme.colors.text, fontWeight: "700", letterSpacing: 0.2 },
  textSmall: { fontSize: 13 }
});
