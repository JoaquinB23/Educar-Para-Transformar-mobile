# Educar para Transformar — App móvil

Cliente móvil Android (React Native + Expo) del Sistema de Gestión del Centro
Educativo "Transformar para Educar". Consume la API del sistema web; no accede
directo a Firestore ni duplica reglas de negocio.

## Requisitos

- Node.js 20 o superior y npm
- Cuenta de Expo y EAS CLI
- Celular Android real
- Backend del sistema web corriendo en la red local

## Configuración

1. Copiar `.env.example` a `.env` y completar las variables.
2. Descargar `google-services.json` desde Firebase Console para la app Android
   con package `com.educar.app` y guardarlo en la raíz.
3. Instalar dependencias:

   ```bash
   npm install
   ```

## Desarrollo

```bash
npx expo start
```

## Build de desarrollo con EAS

```bash
eas login
eas init
eas build --profile development --platform android
```

## Backend

`EXPO_PUBLIC_API_URL` no puede ser `localhost` desde el celular. Usar la IP
local de la PC (por ejemplo `http://192.168.X.X:3000`) o una URL HTTPS de túnel.
El celular y la PC deben estar en la misma red; el Firewall de Windows puede
bloquear el puerto 3000.

## Estructura

```text
src/
  app/            rutas de expo-router
  core/config/    variables de entorno y Firebase
  core/api/       cliente HTTP
  features/       acceso, docentes, notificaciones, alumnos, salud
```

La documentación de endpoints de la app se completa en las fases siguientes.
