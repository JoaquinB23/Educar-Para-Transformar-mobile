import { useCallback, useEffect, useState } from "react";

import { registerForPushNotifications } from "@/features/notificaciones/services/pushNotifications";

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

async function loadPushToken(): Promise<Omit<PushTokenState, "loading">> {
  try {
    const token = await registerForPushNotifications();

    if (__DEV__ && token) {
      console.log("[push] Token FCM:", token);
    }

    return { token, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo obtener el token de notificaciones.";
    return { token: null, error: message };
  }
}

export function usePushToken() {
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

  const requestToken = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    const result = await loadPushToken();
    setState({ ...result, loading: false });
  }, []);

  return { ...state, requestToken };
}
