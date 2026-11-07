import { useQuery } from '@tanstack/react-query';

import { useSession } from '../../../core/auth/session';

import { listarNotificaciones } from '../repositories/notificaciones.repository';

export const notificacionesQueryKey = ['notificaciones'] as const;

export function useNotificaciones() {
  const { status, perfil } = useSession();

  return useQuery({
    queryKey: notificacionesQueryKey,
    queryFn: () => listarNotificaciones(perfil),
    staleTime: 0,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: 1,
    enabled: status === 'autenticado',
  });
}
