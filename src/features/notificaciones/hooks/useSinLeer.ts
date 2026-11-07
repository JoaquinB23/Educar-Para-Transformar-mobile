import { useNotificaciones } from './useNotificaciones';

export function useSinLeer(): number {
  const notificaciones = useNotificaciones();
  return notificaciones.data?.sinLeer ?? 0;
}
