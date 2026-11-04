function requireEnvironmentVariable(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing environment variable ${name}. Set it in .env (see .env.example).`);
  }

  return value;
}

export const env = {
  apiUrl: requireEnvironmentVariable('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL),
  firebaseApiKey: requireEnvironmentVariable(
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  ),
  firebaseAuthDomain: requireEnvironmentVariable(
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  ),
  firebaseProjectId: requireEnvironmentVariable(
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  ),
  firebaseAppId: requireEnvironmentVariable(
    'EXPO_PUBLIC_FIREBASE_APP_ID',
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  ),
  mockRol: process.env.EXPO_PUBLIC_MOCK_ROL,
};
