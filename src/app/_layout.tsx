import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { AuthProvider } from '../core/auth/session';
import { configureNotificationHandler } from '../features/notificaciones/services/pushNotifications';

const queryClient = new QueryClient();

configureNotificationHandler();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack />
      </AuthProvider>
    </QueryClientProvider>
  );
}
