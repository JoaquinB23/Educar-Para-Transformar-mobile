import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from "firebase/auth";

import { firebaseConfig, isConfigComplete } from "@/core/config/env";

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!isConfigComplete) {
    throw new Error(
      "La configuración de Firebase está incompleta. Completá el archivo .env antes de iniciar sesión.",
    );
  }

  if (authInstance) return authInstance;

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Fast Refresh puede volver a ejecutar este módulo cuando Auth ya existe.
    authInstance = getAuth(app);
  }

  return authInstance;
}
