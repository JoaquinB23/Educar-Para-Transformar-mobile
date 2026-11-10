import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

import { crearSecureStorage } from '../storage/secureStorage';

import { env } from './env';

const firebaseApp = initializeApp({
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  appId: env.firebaseAppId,
});

// AsyncStorage se usa únicamente para migrar la sesión heredada a SecureStore
// y borrar la copia sin cifrar en el primer arranque.
const secureStorage = crearSecureStorage(undefined, AsyncStorage);

export const auth = initializeAuth(firebaseApp, {
  // Firebase serializa el usuario y lo persiste a través de nuestro adaptador,
  // que cifra la sesión con SecureStore y la fragmenta según sus límites.
  persistence: getReactNativePersistence(secureStorage),
});
