import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '../../../core/auth/session';

import { informarPago, listarPagos } from '../repositories/pagos.repository';

export const pagosQueryKey = ['pagos'] as const;

export function usePagos() {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const consulta = useQuery({
    queryKey: pagosQueryKey,
    queryFn: listarPagos,
    retry: 1,
    enabled: status === 'autenticado',
  });

  const registro = useMutation({
    mutationFn: informarPago,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pagosQueryKey });
    },
  });

  return { consulta, registro };
}