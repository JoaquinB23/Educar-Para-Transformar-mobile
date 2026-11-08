import { useQuery } from '@tanstack/react-query';

import { useSession } from '../../../core/auth/session';

import { obtenerAsignaciones } from '../repositories/docentes.repository';

export const asignacionesQueryKey = ['docentes', 'asignaciones'] as const;

export function useAsignaciones() {
  const { status } = useSession();

  return useQuery({
    queryKey: asignacionesQueryKey,
    queryFn: obtenerAsignaciones,
    staleTime: 60_000,
    retry: 1,
    enabled: status === 'autenticado',
  });
}
