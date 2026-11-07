import { api } from '../../../core/api/client';
import type { Perfil } from '../../../core/auth/types';

import { ENDPOINTS_NOTIFICACIONES } from './endpoints';
import { crearNotificacionesMock } from './mocks';
import type { Notificacion, NotificacionesRespuesta } from '../types';

export async function listarNotificaciones(perfil: Perfil | null): Promise<NotificacionesRespuesta> {
  if (__DEV__ && process.env.EXPO_PUBLIC_MOCK_DATA === 'true') {
    if (!perfil) {
      throw new Error('No se pudo crear el mock sin el perfil autenticado.');
    }

    return crearNotificacionesMock(perfil);
  }

  const response = await api.get<NotificacionesRespuesta>(ENDPOINTS_NOTIFICACIONES.listar);
  return response.data;
}

export async function marcarLeida(
  id: string,
  notificacion?: Notificacion,
): Promise<Notificacion> {
  if (__DEV__ && process.env.EXPO_PUBLIC_MOCK_DATA === 'true') {
    if (!notificacion) {
      throw new Error('No se pudo actualizar el mock de la notificación.');
    }

    return { ...notificacion, leida: true, leidaEn: new Date().toISOString() };
  }

  const response = await api.put<Notificacion>(ENDPOINTS_NOTIFICACIONES.marcarLeida(id), {
    leida: true,
  });
  return response.data;
}

export async function registrarPushToken(
  token: string,
  plataforma: 'android' | 'ios' = 'android',
): Promise<void> {
  if (__DEV__ && process.env.EXPO_PUBLIC_MOCK_DATA === 'true') {
    return;
  }

  await api.post(ENDPOINTS_NOTIFICACIONES.registrarToken, { token, plataforma });
}

export async function eliminarPushToken(token: string): Promise<void> {
  if (__DEV__ && process.env.EXPO_PUBLIC_MOCK_DATA === 'true') {
    return;
  }

  // El backend recibe el token en el body del DELETE, no en la query.
  await api.delete(ENDPOINTS_NOTIFICACIONES.eliminarToken, { data: { token } });
}
