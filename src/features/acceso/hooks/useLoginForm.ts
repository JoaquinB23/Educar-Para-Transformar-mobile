import { useCallback, useState } from 'react';

import { useSession } from '../../../core/auth/session';

export function useLoginForm() {
  const { iniciarSesion, error: errorSesion, status } = useSession();
  const [dni, setDniState] = useState('');
  const [password, setPassword] = useState('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const enviando = status === 'cargando';

  const setDni = useCallback((valor: string) => {
    setDniState(valor.replace(/\D/g, ''));
  }, []);

  const enviar = useCallback(async () => {
    if (!dni) {
      setErrorValidacion('Ingresá tu DNI');
      return;
    }

    if (!password) {
      setErrorValidacion('Ingresá tu contraseña');
      return;
    }

    setErrorValidacion(null);

    try {
      await iniciarSesion(dni, password);
    } catch {
      // El mensaje ya queda en session.error y lo mostramos en pantalla.
    }
  }, [dni, password, iniciarSesion]);

  return {
    dni,
    setDni,
    password,
    setPassword,
    enviar,
    enviando,
    error: errorValidacion ?? errorSesion,
  };
}
