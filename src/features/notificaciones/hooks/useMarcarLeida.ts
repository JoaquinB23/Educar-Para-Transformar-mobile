import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificacionesQueryKey } from './useNotificaciones';

import { marcarLeida } from '../repositories/notificaciones.repository';
import type { Notificacion, NotificacionesRespuesta } from '../types';

export function useMarcarLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificacion: Notificacion) =>
      marcarLeida(notificacion.id, notificacion),
    onMutate: async (notificacion) => {
      await queryClient.cancelQueries({ queryKey: notificacionesQueryKey });
      const anterior =
        queryClient.getQueryData<NotificacionesRespuesta>(notificacionesQueryKey);

      queryClient.setQueryData<NotificacionesRespuesta>(notificacionesQueryKey, (actual) => {
        if (!actual) {
          return actual;
        }

        const estabaSinLeer = actual.notificaciones.some(
          (item) => item.id === notificacion.id && !item.leida,
        );

        return {
          ...actual,
          notificaciones: actual.notificaciones.map((item) =>
            item.id === notificacion.id ? { ...item, leida: true } : item,
          ),
          sinLeer: estabaSinLeer ? Math.max(0, actual.sinLeer - 1) : actual.sinLeer,
        };
      });

      return { anterior };
    },
    onError: (_error, _notificacion, context) => {
      if (context?.anterior) {
        queryClient.setQueryData(notificacionesQueryKey, context.anterior);
      }
    },
    onSuccess: (actualizada) => {
      queryClient.setQueryData<NotificacionesRespuesta>(notificacionesQueryKey, (actual) => {
        if (!actual) {
          return actual;
        }

        return {
          ...actual,
          notificaciones: actual.notificaciones.map((item) =>
            item.id === actualizada.id
              ? { ...item, leida: actualizada.leida, leidaEn: actualizada.leidaEn }
              : item,
          ),
        };
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: notificacionesQueryKey });
    },
  });
}
