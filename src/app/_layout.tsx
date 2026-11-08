import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { RUTAS } from '../core/auth/rutas';
import { AuthProvider, useSession } from '../core/auth/session';
import { PantallaCarga } from '../core/components/PantallaCarga';
import { configureNotificationHandler } from '../features/notificaciones/services/pushNotifications';

const queryClient = new QueryClient();

configureNotificationHandler();

function NavegacionRaiz() {
  const { status, inicializado } = useSession();

  // Splash sólo hasta que Firebase resuelve la sesión por primera vez. Después
  // el Stack queda montado, incluso mientras se procesa un login.
  if (!inicializado) return <PantallaCarga />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status !== 'autenticado'} redirectTo={RUTAS.inicio}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'autenticado'} redirectTo={RUTAS.login}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavegacionRaiz />
      </AuthProvider>
    </QueryClientProvider>
  );
}
