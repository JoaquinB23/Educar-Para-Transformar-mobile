import { useQuery } from '@tanstack/react-query';

import { useSession } from '../../../core/auth/session';

import { obtenerHijos } from '../repositories/asistencia-historial.repository';

export function hijosQueryKey() {
  return ['asistencia-historial', 'hijos'] as const;
}

export function useHijos(habilitado: boolean) {
  const { status } = useSession();

  return useQuery({
    queryKey: hijosQueryKey(),
    queryFn: obtenerHijos,
    enabled: status === 'autenticado' && habilitado,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}
