import { useQuery } from '@tanstack/react-query';

import { ApiError } from '../../../core/api/errors';
import { useSession } from '../../../core/auth/session';
import { ROLES } from '../../../core/auth/types';

import { obtenerFicha } from '../repositories/salud.repository';

export function useFichaMedica(alumnoId?: string) {
  const { status, perfil } = useSession();
  const idAutorizado =
    perfil?.rol === ROLES.PADRE && alumnoId && perfil.hijoIds.includes(alumnoId)
      ? alumnoId
      : undefined;

  return useQuery({
    queryKey: ['ficha', alumnoId],
    queryFn: () => {
      if (!idAutorizado) {
        throw new ApiError(
          403,
          'Sólo podés consultar la ficha médica de tus hijos vinculados',
        );
      }

      return obtenerFicha(idAutorizado);
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    enabled: status === 'autenticado' && Boolean(idAutorizado),
  });
}
