import { useQueries } from '@tanstack/react-query';

import { useSession } from '../../../core/auth/session';
import { ROLES } from '../../../core/auth/types';
import { nombreCompleto } from '../../../core/utils/nombre';

import { obtenerAlumno } from '../repositories/academico.repository';
import type { Hijo } from '../types';

export function useHijos() {
  const { status, perfil } = useSession();
  const hijoIds = perfil?.rol === ROLES.PADRE ? perfil.hijoIds : [];
  const consultas = useQueries({
    queries: hijoIds.map((id) => ({
      queryKey: ['alumno', id],
      queryFn: () => obtenerAlumno(id),
      staleTime: 60_000,
      retry: 1,
      enabled: status === 'autenticado',
    })),
  });

  const hijos: Hijo[] = consultas.flatMap((consulta, index) => {
    const alumno = consulta.data;
    if (!alumno) {
      return [];
    }

    return [{ id: hijoIds[index], nombre: nombreCompleto(alumno.nombre, alumno.apellido) }];
  });

  return {
    hijoIds,
    hijos,
    isLoading: consultas.some((consulta) => consulta.isLoading),
    error: consultas.find((consulta) => consulta.isError)?.error ?? null,
    refetch: async () => {
      await Promise.all(consultas.map((consulta) => consulta.refetch()));
    },
  };
}
