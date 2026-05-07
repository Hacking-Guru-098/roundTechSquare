import React from "react";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { QueryProvider } from "./src/services/queryClient";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </QueryProvider>
  );
}
