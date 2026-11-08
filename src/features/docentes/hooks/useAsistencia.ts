import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '../../../core/api/errors';
import { useSession } from '../../../core/auth/session';

import { guardarAsistencia, obtenerAsistencias } from '../repositories/docentes.repository';
import type { RegistroAsistencia, ResultadoAsistencia } from '../types';

export function asistenciaQueryKey(materiaId: string, fecha: string) {
  return ['docentes', 'asistencias', materiaId, fecha] as const;
}

export interface GuardarAsistenciaVariables {
  materiaId: string;
  fecha: string;
  registros: RegistroAsistencia[];
}

export function useAsistencia(materiaId: string | undefined, fecha: string) {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const consulta = useQuery({
    queryKey: asistenciaQueryKey(materiaId ?? 'sin-materia', fecha),
    queryFn: () => {
      if (!materiaId) {
        throw new ApiError(400, 'Seleccioná una materia.');
      }

      return obtenerAsistencias(materiaId, fecha);
    },
    staleTime: 0,
    retry: 1,
    enabled: status === 'autenticado' && Boolean(materiaId),
  });

  const mutacion = useMutation<ResultadoAsistencia, unknown, GuardarAsistenciaVariables>({
    mutationFn: guardarAsistencia,
    onSuccess: (_resultado, variables) => {
      void queryClient.invalidateQueries({
        queryKey: asistenciaQueryKey(variables.materiaId, variables.fecha),
      });
    },
  });

  return { consulta, mutacion };
}
