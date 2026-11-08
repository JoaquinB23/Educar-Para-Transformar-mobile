import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { setUnauthorizedHandler } from '../api/client';
import { auth } from '../config/firebase';
import { eliminarPushToken } from '../../features/notificaciones/repositories/notificaciones.repository';
import { getCurrentPushToken } from '../../features/notificaciones/services/pushNotifications';

import { traducirErrorAuth } from './errors';
import { dniAEmail } from './dni';
import { obtenerPerfil } from './perfil.repository';
import type { Perfil } from './types';

type SessionStatus = 'cargando' | 'autenticado' | 'anonimo';

interface SessionState {
  status: SessionStatus;
  perfil: Perfil | null;
  error: string | null;
}

interface SessionContextValue extends SessionState {
  // false hasta que Firebase resolvió la sesión por primera vez. Sirve para
  // mostrar el splash de arranque sin parpadear el login.
  inicializado: boolean;
  iniciarSesion(dni: string, password: string): Promise<void>;
  cerrarSesion(): Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function mensajeDeError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<SessionState>({
    status: 'cargando',
    perfil: null,
    error: null,
  });
  const [inicializado, setInicializado] = useState(false);
  const authRequestId = useRef(0);
  const errorTrasCerrarSesion = useRef<string | null>(null);

  const cerrarSesionPor401 = useCallback(async () => {
    const message = 'La sesión expiró. Iniciá sesión nuevamente.';
    errorTrasCerrarSesion.current = message;
    setSession({ status: 'anonimo', perfil: null, error: message });

    try {
      await signOut(auth);
    } catch {
      errorTrasCerrarSesion.current = null;
      setSession({
        status: 'anonimo',
        perfil: null,
        error: 'No se pudo cerrar la sesión. Intentá nuevamente.',
      });
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void cerrarSesionPor401();
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          authRequestId.current += 1;
          const error = errorTrasCerrarSesion.current;
          errorTrasCerrarSesion.current = null;
          setInicializado(true);
          setSession({ status: 'anonimo', perfil: null, error });
          return;
        }

        errorTrasCerrarSesion.current = null;
        const requestId = ++authRequestId.current;
        setSession({ status: 'cargando', perfil: null, error: null });

        void obtenerPerfil()
          .then((perfil) => {
            if (requestId === authRequestId.current) {
              setInicializado(true);
              setSession({ status: 'autenticado', perfil, error: null });
            }
          })
          .catch(async (error: unknown) => {
            if (requestId !== authRequestId.current) {
              return;
            }

            setInicializado(true);
            const message = mensajeDeError(error, 'No se pudo cargar el perfil.');
            errorTrasCerrarSesion.current = message;

            try {
              await signOut(auth);
              if (requestId === authRequestId.current) {
                setSession({ status: 'anonimo', perfil: null, error: message });
              }
            } catch {
              errorTrasCerrarSesion.current = null;
              if (requestId === authRequestId.current) {
                setSession({
                  status: 'anonimo',
                  perfil: null,
                  error: `${message} No se pudo cerrar la sesión de Firebase.`,
                });
              }
            }
          });
      },
      () => {
        authRequestId.current += 1;
        errorTrasCerrarSesion.current = null;
        setInicializado(true);
        setSession({
          status: 'anonimo',
          perfil: null,
          error: 'No se pudo verificar la sesión.',
        });
      },
    );

    return () => {
      setUnauthorizedHandler(null);
      unsubscribe();
    };
  }, [cerrarSesionPor401]);

  const iniciarSesion = useCallback(async (dni: string, password: string) => {
    setSession({ status: 'cargando', perfil: null, error: null });

    // Único punto donde el DNI se convierte al email que espera Firebase.
    const email = dniAEmail(dni);
    if (!email) {
      const message = 'Ingresá un DNI válido';
      setSession({ status: 'anonimo', perfil: null, error: message });
      throw new Error(message);
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const message = traducirErrorAuth(error);
      setSession({ status: 'anonimo', perfil: null, error: message });
      throw new Error(message);
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    // Best-effort: si falla la red, el token ya no existe o no hay permisos,
    // igual cerramos la sesión de Firebase.
    try {
      const token = await getCurrentPushToken();
      if (token) {
        await eliminarPushToken(token);
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[push] No se pudo revocar el token al cerrar sesión:', error);
      }
    }

    try {
      await signOut(auth);
      setSession({ status: 'anonimo', perfil: null, error: null });
    } catch {
      const message = 'No se pudo cerrar la sesión. Intentá nuevamente.';
      setSession({ status: 'anonimo', perfil: null, error: message });
      throw new Error(message);
    }
  }, []);

  const value = useMemo(
    () => ({ ...session, inicializado, iniciarSesion, cerrarSesion }),
    [session, inicializado, iniciarSesion, cerrarSesion],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('useSession debe usarse dentro de AuthProvider.');
  }

  return session;
}
