import type { Persistence } from "firebase/auth";

// Firebase 13 expone getReactNativePersistence solo en su entrypoint de React
// Native. Metro lo resuelve en runtime, pero los tipos publicados apuntan al
// entrypoint web, así que completamos la declaración acá.
declare module "firebase/auth" {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
