import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { Pressable, Text } from 'react-native';

import { setUnauthorizedHandler } from '../api/client';
import { eliminarPushToken } from '../../features/notificaciones/repositories/notificaciones.repository';
import { getCurrentPushToken } from '../../features/notificaciones/services/pushNotifications';

import { AuthProvider, useSession } from './session';
import { obtenerPerfil } from './perfil.repository';
import type { Perfil } from './types';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('../config/firebase', () => ({
  auth: { currentUser: null },
}));

jest.mock('../api/client', () => ({
  setUnauthorizedHandler: jest.fn(),
}));

jest.mock('./perfil.repository', () => ({
  obtenerPerfil: jest.fn(),
}));

jest.mock('../../features/notificaciones/services/pushNotifications', () => ({
  getCurrentPushToken: jest.fn(),
}));

jest.mock('../../features/notificaciones/repositories/notificaciones.repository', () => ({
  eliminarPushToken: jest.fn(),
}));

type AuthNext = (user: User | null) => void;
type AuthError = (error: Error) => void;

const onAuthStateChangedMock = onAuthStateChanged as unknown as jest.MockedFunction<
  (auth: unknown, next: AuthNext, error?: AuthError) => () => void
>;

const perfil: Perfil = {
  id: 'u1',
  nombre: 'Ana Pérez',
  email: '12345678@escuela.edu.ar',
  rol: 'padre',
  hijoIds: [],
};

let emitAuth: AuthNext | null = null;
let emitAuthError: AuthError | null = null;

function Sonda() {
  const {
    status,
    perfil: perfilActual,
    error,
    inicializado,
    iniciarSesion,
    cerrarSesion,
  } = useSession();

  return (
    <>
      <Text testID="estado">{status}</Text>
      <Text testID="inicializado">{String(inicializado)}</Text>
      <Text testID="perfil">{perfilActual?.nombre ?? ''}</Text>
      <Text testID="error">{error ?? ''}</Text>
      <Pressable
        testID="iniciar"
        onPress={() => {
          iniciarSesion(' 12345678 ', 'secreto').catch(() => {});
        }}
      />
      <Pressable
        testID="cerrar"
        onPress={() => {
          cerrarSesion().catch(() => {});
        }}
      />
    </>
  );
}

async function renderizar() {
  await render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    emitAuth = null;
    emitAuthError = null;

    onAuthStateChangedMock.mockImplementation((_auth, next, error) => {
      emitAuth = next;
      emitAuthError = error ?? null;
      return () => {};
    });

    jest.mocked(signInWithEmailAndPassword).mockResolvedValue({} as UserCredential);
    jest.mocked(signOut).mockResolvedValue(undefined);
    jest.mocked(obtenerPerfil).mockResolvedValue(perfil);
    jest.mocked(getCurrentPushToken).mockResolvedValue(null);
    jest.mocked(eliminarPushToken).mockResolvedValue(undefined);
    jest.mocked(setUnauthorizedHandler).mockImplementation(() => {});
  });

  it('restaura la sesión persistida y carga el perfil', async () => {
    await renderizar();

    await act(async () => {
      emitAuth?.({ uid: 'u1' } as User);
    });

    expect(await screen.findByText('autenticado')).toBeTruthy();
    expect(screen.getByText('Ana Pérez')).toBeTruthy();
    expect(screen.getByTestId('inicializado').props.children).toBe('true');
  });

  it('queda anónimo cuando no hay sesión persistida', async () => {
    await renderizar();

    await act(async () => {
      emitAuth?.(null);
    });

    expect(screen.getByText('anonimo')).toBeTruthy();
    expect(screen.getByTestId('inicializado').props.children).toBe('true');
  });

  it('mantiene la conversión DNI → correo al iniciar sesión', async () => {
    await renderizar();

    await fireEvent.press(screen.getByTestId('iniciar'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        '12345678@escuela.edu.ar',
        'secreto',
      );
    });
  });

  it('traduce los errores de credenciales', async () => {
    jest.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/invalid-credential' });

    await renderizar();
    await fireEvent.press(screen.getByTestId('iniciar'));

    expect(await screen.findByText('DNI o contraseña incorrectos')).toBeTruthy();
    expect(screen.getByText('anonimo')).toBeTruthy();
  });

  it('revoca el push token y cierra Firebase al cerrar sesión', async () => {
    jest.mocked(getCurrentPushToken).mockResolvedValue('push-token');

    await renderizar();
    await fireEvent.press(screen.getByTestId('cerrar'));

    await waitFor(() => {
      expect(eliminarPushToken).toHaveBeenCalledWith('push-token');
      expect(signOut).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('anonimo')).toBeTruthy();
  });

  it('cierra la sesión cuando el backend responde 401', async () => {
    await renderizar();

    const handler = jest.mocked(setUnauthorizedHandler).mock.calls.at(-1)?.[0];
    expect(handler).toBeTruthy();

    await act(async () => {
      handler?.();
    });

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('La sesión expiró. Iniciá sesión nuevamente.')).toBeTruthy();
    expect(screen.getByText('anonimo')).toBeTruthy();
  });

  it('cierra la sesión si el perfil no se puede cargar', async () => {
    jest.mocked(obtenerPerfil).mockRejectedValue(new Error('sin permisos'));

    await renderizar();

    await act(async () => {
      emitAuth?.({ uid: 'u1' } as User);
    });

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('sin permisos')).toBeTruthy();
  });

  it('informa cuando Firebase no puede verificar la sesión', async () => {
    await renderizar();

    await act(async () => {
      emitAuthError?.(new Error('fallo de storage'));
    });

    expect(screen.getByText('No se pudo verificar la sesión.')).toBeTruthy();
    expect(screen.getByText('anonimo')).toBeTruthy();
  });
});
