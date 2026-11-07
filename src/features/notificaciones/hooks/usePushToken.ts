import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { useSession } from '@/core/auth/session';
import { registerForPushNotifications } from '@/features/notificaciones/services/pushNotifications';

import { registrarPushToken } from '../repositories/notificaciones.repository';

type PushTokenState = {
  token: string | null;
  error: string | null;
  loading: boolean;
};

const initialState: PushTokenState = {
  token: null,
  error: null,
  loading: true,
};

async function loadPushToken(): Promise<Omit<PushTokenState, 'loading'>> {
  try {
    const token = await registerForPushNotifications();

    if (__DEV__ && token) {
      console.log('[push] Token FCM:', token);
    }

    return { token, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'No se pudo obtener el token de notificaciones.';
    return { token: null, error: message };
  }
}

export function usePushToken() {
  const { status } = useSession();
  const [state, setState] = useState<PushTokenState>(initialState);

  useEffect(() => {
    let cancelled = false;

    void loadPushToken().then((result) => {
      if (!cancelled) {
        setState({ ...result, loading: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // El token se registra en el backend sólo con sesión autenticada. El
  // endpoint hace upsert por token, así que repetirlo no genera duplicados.
  useEffect(() => {
    if (status !== 'autenticado' || !state.token) return;

    void registrarPushToken(
      state.token,
      Platform.OS === 'ios' ? 'ios' : 'android',
    ).catch((error: unknown) => {
      if (__DEV__) {
        console.warn('[push] No se pudo registrar el token en el backend:', error);
      }
    });
  }, [status, state.token]);

  const requestToken = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    const result = await loadPushToken();
    setState({ ...result, loading: false });
  }, []);

  return { ...state, requestToken };
}
