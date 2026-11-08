import { usePushToken } from '../hooks/usePushToken';

// Componente invisible: monta el registro del token FCM cuando hay sesión.
// Se usa sólo para los roles que reciben notificaciones push.
export function RegistroPushToken() {
  usePushToken();
  return null;
}
