import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { isConfigComplete } from "@/core/config/env";
import { getFirebaseAuth } from "@/core/firebase/client";
import { configureNotificationHandler } from "@/features/notificaciones/services/pushNotifications";

configureNotificationHandler();

export default function RootLayout() {
  useEffect(() => {
    if (isConfigComplete) {
      getFirebaseAuth();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
