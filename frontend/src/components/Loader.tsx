import React from "react";
import { ActivityIndicator, View } from "react-native";
import { theme } from "../utils/theme";

export function Loader() {
  return (
    <View style={{ paddingVertical: 24, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

