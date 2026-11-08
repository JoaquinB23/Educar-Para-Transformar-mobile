import { useCallback, useState } from 'react';

import { useSession } from '../../../core/auth/session';

export function useCerrarSesion() {
  const { cerrarSesion } = useSession();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = useCallback(async () => {
    setEnviando(true);
    setError(null);

    try {
      await cerrarSesion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cerrar la sesión.');
    } finally {
      setEnviando(false);
    }
  }, [cerrarSesion]);

  return { cerrar, enviando, error };
}
