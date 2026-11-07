# Contrato de notificaciones

## Listar notificaciones

`GET /api/notificaciones` requiere un token válido (`verifyToken`) y no aplica
una restricción adicional por rol. Solo devuelve documentos cuyo
`destinatarioUid` coincide con el UID autenticado.

### Query params

- `leidas` (opcional): `"true"` filtra las leídas; `"false"` filtra las no
  leídas. Si se envía cualquier otro valor, el código lo trata como `false`.

### Respuesta

La respuesta exitosa tiene la forma exacta `{ "ok": true, "data": { ... } }`.
Cada notificación contiene `id` (el ID del documento de Firestore) y todos los
campos almacenados en ese documento. `sinLeer` cuenta las notificaciones no
leídas del resultado, después de aplicar el filtro `leidas`.

Las notificaciones se ordenan por `creadaEn` descendente. No hay paginación:
se leen todos los documentos del destinatario.

Ejemplo con una notificación de tipo `ausencia`:

```json
{
  "ok": true,
  "data": {
    "notificaciones": [
      {
        "id": "notificacion-123",
        "destinatarioUid": "tutor-456",
        "tipo": "ausencia",
        "titulo": "Ana Pérez estuvo ausente",
        "mensaje": "El alumno fue marcado como ausente el 2026-11-06 en Matemática.",
        "alumnoId": "alumno-789",
        "asistenciaId": "asistencia-321",
        "materiaId": "materia-654",
        "fecha": "2026-11-06",
        "leida": false,
        "creadaEn": "2026-11-06T15:00:00.000Z"
      }
    ],
    "sinLeer": 1
  }
}
```

Ejemplo con una notificación de tipo `atencion`:

```json
{
  "ok": true,
  "data": {
    "notificaciones": [
      {
        "id": "notificacion-987",
        "destinatarioUid": "tutor-456",
        "tipo": "atencion",
        "titulo": "Atención en enfermería",
        "mensaje": "Se registró una atención de Ana Pérez el 2026-11-06. Consultá el detalle en la app.",
        "alumnoId": "alumno-789",
        "atencionId": "atencion-654",
        "fecha": "2026-11-06",
        "leida": false,
        "creadaEn": "2026-11-06T15:00:00.000Z"
      }
    ],
    "sinLeer": 1
  }
}
```

Ejemplo con una notificación de tipo `tardanza`:

```json
{
  "ok": true,
  "data": {
    "notificaciones": [
      {
        "id": "notificacion-555",
        "destinatarioUid": "tutor-456",
        "tipo": "tardanza",
        "titulo": "Ana Pérez llegó tarde",
        "mensaje": "El alumno llegó tarde el 2026-11-06 en Matemática.",
        "alumnoId": "alumno-789",
        "asistenciaId": "asistencia-322",
        "materiaId": "materia-654",
        "fecha": "2026-11-06",
        "leida": false,
        "creadaEn": "2026-11-06T15:00:00.000Z"
      }
    ],
    "sinLeer": 1
  }
}
```

## Marcar una notificación como leída

Existe `PUT /api/notificaciones/:id/leida`, protegido por `verifyToken` y sin
restricción adicional por rol. Solo el destinatario puede actualizarla. Recibe
`{ "leida": true }` o `{ "leida": false }`; la respuesta exitosa envuelve la
notificación actualizada en `{ "ok": true, "data": ... }` y agrega `leidaEn`
(fecha ISO cuando se marca leída, `null` cuando se marca no leída).

## Push del backend

Cuando se registra una ausencia, una tardanza o una atención, el backend
también envía un push de Firebase Cloud Messaging. El texto es siempre genérico
y no incluye diagnóstico, motivo ni medicación:

- Título: `Educar para Transformar`
- Cuerpo: `Hay una novedad sobre su hijo/a. Abrí la app para verla.`
- `data.destino`: `"notificaciones"`
- Android: `priority: "high"` y `channelId: "default"`

El canal `default` es el que crea la app como “Avisos” con importancia máxima.
La navegación al tocar el push no está implementada todavía: `data.destino`
queda reservado para resolverla más adelante.

El envío es best-effort. Si FCM falla o tarda más de 4 segundos, la asistencia,
la atención y el documento en `notificaciones` ya quedaron guardados y la
respuesta HTTP no cambia.

## Registrar el token del dispositivo

`POST /api/push-token` requiere `verifyToken`.

Body:

```json
{
  "token": "fL9A53...XeRJc",
  "plataforma": "android"
}
```

- `token`: string no vacío, máximo 4096 caracteres.
- `plataforma`: sólo `"android"` o `"ios"`; cualquier otro valor se ignora y
  queda `"android"`.

El ID del documento es `sha256(token)`, así que la operación es un upsert. Si el
token ya estaba asociado a otro usuario (mismo celular, otra cuenta), se
reasigna al usuario autenticado: un token pertenece a un solo usuario.

Respuestas:

- `201`: token nuevo.
- `200`: token actualizado o reasignado.
- `400`: falta el token o supera el máximo.
- `401`: falta el token de Firebase o es inválido.

## Eliminar el token del dispositivo

`DELETE /api/push-token` requiere `verifyToken`.

El token viaja explícitamente en el **body**, no en la query:

```json
{
  "token": "fL9A53...XeRJc"
}
```

- `200`: `{ "eliminado": true }` si existía, o `{ "eliminado": false }` si ya
  no estaba.
- `403`: el token pertenece a otro usuario.
- `400`: falta el token o supera el máximo.
- `401`: falta el token de Firebase o es inválido.

Al cerrar sesión la app intenta este DELETE, pero el `signOut` de Firebase se
ejecuta igual si el DELETE falla por red, 401 o cualquier otro error. En modo
mock el DELETE no se llama.
