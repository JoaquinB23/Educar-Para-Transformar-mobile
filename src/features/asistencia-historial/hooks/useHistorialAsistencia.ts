import { useQuery } from '@tanstack/react-query';

import { ApiError } from '../../../core/api/errors';
import { useSession } from '../../../core/auth/session';

import { obtenerHistorialAsistencia } from '../repositories/asistencia-historial.repository';

export function historialAsistenciaQueryKey(alumnoId: string) {
  return ['asistencia-historial', 'alumno', alumnoId] as const;
}

export function useHistorialAsistencia(alumnoId: string | undefined) {
  const { status } = useSession();

  return useQuery({
    queryKey: historialAsistenciaQueryKey(alumnoId ?? 'sin-alumno'),
    queryFn: () => {
      if (!alumnoId) {
        throw new ApiError(400, 'Seleccioná un alumno.');
      }

      return obtenerHistorialAsistencia(alumnoId);
    },
    enabled: status === 'autenticado' && Boolean(alumnoId),
    retry: 1,
    staleTime: 0,
  });
}
