import { useCallback, useState } from 'react';

import { useSession } from '../../../core/auth/session';

import { normalizarCorreo } from '../utils/correo';

export function useLoginForm() {
  const { iniciarSesion, error: errorSesion, status } = useSession();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const enviando = status === 'cargando';

  const enviar = useCallback(async () => {
    if (!correo.trim()) {
      setErrorValidacion('Ingresá tu correo');
      return;
    }

    const email = normalizarCorreo(correo);
    if (!email) {
      setErrorValidacion('Ingresá un DNI válido');
      return;
    }

    if (!password) {
      setErrorValidacion('Ingresá tu contraseña');
      return;
    }

    setErrorValidacion(null);

    try {
      await iniciarSesion(email, password);
    } catch {
      // El mensaje ya queda en session.error y lo mostramos en pantalla.
    }
  }, [correo, password, iniciarSesion]);

  return {
    correo,
    setCorreo,
    password,
    setPassword,
    enviar,
    enviando,
    error: errorValidacion ?? errorSesion,
  };
}
