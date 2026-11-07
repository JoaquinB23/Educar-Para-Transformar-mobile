import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

const DEFAULT_CHANNEL_ID = 'default';

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureDefaultChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: 'Avisos',
    importance: AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;

  await ensureDefaultChannel();

  const currentPermission = await Notifications.getPermissionsAsync();
  let status = currentPermission.status;

  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }

  if (status !== 'granted') {
    throw new Error('No se otorgó el permiso de notificaciones.');
  }

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    return String(token.data);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const hint = Device.isDevice
      ? ''
      : ' El emulador o la máquina virtual necesita una imagen con Google Play services.';

    throw new Error(`No se pudo obtener el token FCM. Verificá google-services.json.${hint} Detalle: ${detail}`);
  }
}

// Lectura silenciosa para el cierre de sesión: si no hay permiso o el token
// no está disponible, devuelve null sin interrumpir el signOut.
export async function getCurrentPushToken(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    return String(token.data);
  } catch {
    return null;
  }
}
