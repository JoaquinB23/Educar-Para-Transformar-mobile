import { useQuery } from '@tanstack/react-query';

import { ApiError } from '../../../core/api/errors';
import { useSession } from '../../../core/auth/session';
import { ROLES } from '../../../core/auth/types';

import { obtenerDatosAcademicos } from '../repositories/academico.repository';

export function useDatosAcademicos(alumnoId?: string) {
  const { status, perfil } = useSession();
  const idAutorizado =
    perfil?.rol === ROLES.ALUMNO
      ? perfil.alumnoId
      : perfil?.rol === ROLES.PADRE && alumnoId && perfil.hijoIds.includes(alumnoId)
        ? alumnoId
        : undefined;

  return useQuery({
    queryKey: ['academico', alumnoId ?? 'propio'],
    queryFn: () => {
      if (!idAutorizado) {
        throw new ApiError(403, 'No tenés acceso a los datos de este alumno.');
      }

      return obtenerDatosAcademicos(idAutorizado);
    },
    staleTime: 60_000,
    retry: 1,
    enabled: status === 'autenticado' && Boolean(idAutorizado),
  });
}
