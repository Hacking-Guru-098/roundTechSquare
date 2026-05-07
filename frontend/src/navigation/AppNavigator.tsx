import React from "react";
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { TaskListScreen } from "../screens/TaskListScreen";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Tasks: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const DarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: "#4F7CFF",
    background: "#0B0F1A",
    card: "#121A2A",
    text: "#E8EEF9",
    border: "rgba(232,238,249,0.12)",
    notification: "#FF4D4F"
  }
};

export function AppNavigator() {
  const { token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B0F1A", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F7CFF" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "#0B0F1A" }
        }}
      >
        {token ? (
          <Stack.Screen name="Tasks" component={TaskListScreen} options={{ title: "Tasks" }} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Sign Up" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
