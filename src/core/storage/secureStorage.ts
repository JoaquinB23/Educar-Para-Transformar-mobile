import * as SecureStore from 'expo-secure-store';

// Firebase usa claves como "firebase:authUser:<apiKey>:[DEFAULT]" y guarda el
// usuario serializado completo. SecureStore sólo acepta [A-Za-z0-9._-] en las
// claves y tiene un límite práctico de ~2 KB por valor en Android, así que
// adaptamos ambas cosas sin cambiar el contrato que espera Firebase.
const PREFIX = 'educar.auth.';
const MANIFEST_VERSION = 1;
const DEFAULT_CHUNK_BYTES = 1800;

export interface SecureStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Compatibilidad con la versión anterior, que persistía la sesión en
// AsyncStorage. Sólo se usa para migrarla una vez y borrar el original.
export interface LegacyStorage {
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
}

interface Manifest {
  v: typeof MANIFEST_VERSION;
  chunks: number;
  gen: string;
}

// Los tokens de sesión deben quedar sólo en este dispositivo y accesibles
// únicamente con el dispositivo desbloqueado. En Android esta opción se ignora;
// el cifrado lo provee el Keystore.
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

let generacionSeq = 0;

function encodeKey(key: string): string {
  // Codificación hexadecimal de cada code unit: determinista, sin colisiones y
  // con caracteres permitidos por SecureStore.
  let encoded = '';

  for (let i = 0; i < key.length; i += 1) {
    encoded += key.charCodeAt(i).toString(16).padStart(4, '0');
  }

  return encoded;
}

function manifestKey(key: string): string {
  return `${PREFIX}${encodeKey(key)}.m`;
}

function legacyMarkerKey(key: string): string {
  return `${PREFIX}${encodeKey(key)}.legacy`;
}

function chunkKey(key: string, gen: string, index: number): string {
  return `${PREFIX}${encodeKey(key)}.${gen}.${index.toString(36)}`;
}

function nuevaGeneracion(): string {
  generacionSeq = (generacionSeq + 1) % 0xffffff;
  return `${Date.now().toString(36)}${generacionSeq.toString(36).padStart(4, '0')}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function utf8Bytes(codePoint: number): number {
  if (codePoint <= 0x7f) return 1;
  if (codePoint <= 0x7ff) return 2;
  if (codePoint <= 0xffff) return 3;
  return 4;
}

function partirEnChunks(value: string, maxBytes: number): string[] {
  if (value.length === 0) return [];

  const chunks: string[] = [];
  let actual = '';
  let bytesActuales = 0;

  // for...of recorre code points completos, así no partimos emojis ni
  // caracteres fuera del BMP a la mitad.
  for (const caracter of value) {
    const bytes = utf8Bytes(caracter.codePointAt(0) ?? 0);

    if (bytesActuales + bytes > maxBytes && actual.length > 0) {
      chunks.push(actual);
      actual = '';
      bytesActuales = 0;
    }

    actual += caracter;
    bytesActuales += bytes;
  }

  if (actual.length > 0) chunks.push(actual);
  return chunks;
}

function parseManifest(raw: string | null): Manifest | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null) return null;

    const manifest = parsed as Record<string, unknown>;
    const chunks = manifest.chunks;
    const gen = manifest.gen;

    if (
      manifest.v !== MANIFEST_VERSION ||
      !Number.isInteger(chunks) ||
      (chunks as number) < 0 ||
      typeof gen !== 'string' ||
      !/^[0-9a-z]+$/.test(gen)
    ) {
      return null;
    }

    return { v: MANIFEST_VERSION, chunks: chunks as number, gen };
  } catch {
    return null;
  }
}

function crearCola() {
  const colas = new Map<string, Promise<unknown>>();

  return function enqueue<T>(key: string, tarea: () => Promise<T>): Promise<T> {
    const anterior = colas.get(key) ?? Promise.resolve();
    const siguiente = anterior.then(tarea, tarea);

    colas.set(key, siguiente);

    // Limpiamos la entrada sólo si sigue siendo la última tarea de la clave.
    void siguiente.then(
      () => {
        if (colas.get(key) === siguiente) colas.delete(key);
      },
      () => {
        if (colas.get(key) === siguiente) colas.delete(key);
      },
    );

    return siguiente;
  };
}

export function crearSecureStorage(
  maxChunkBytes = DEFAULT_CHUNK_BYTES,
  legacyStorage?: LegacyStorage,
): SecureStorageAdapter {
  if (!Number.isInteger(maxChunkBytes) || maxChunkBytes <= 0) {
    throw new Error('maxChunkBytes debe ser un entero positivo.');
  }

  const enqueue = crearCola();

  async function leerManifiesto(key: string): Promise<Manifest | null> {
    const raw = await SecureStore.getItemAsync(manifestKey(key), SECURE_STORE_OPTIONS);
    return parseManifest(raw);
  }

  async function limpiarLegacy(key: string): Promise<void> {
    if (!legacyStorage) return;

    try {
      await legacyStorage.removeItem(key);
    } catch {
      // La limpieza es best-effort; el marcador evita volver a migrar el dato.
    }

    try {
      await SecureStore.setItemAsync(legacyMarkerKey(key), '1', SECURE_STORE_OPTIONS);
    } catch {
      // Si falla el marcador, un próximo arranque podría reintentar la migración.
    }
  }

  async function migrarLegacy(key: string): Promise<string | null> {
    if (!legacyStorage) return null;

    const marker = await SecureStore.getItemAsync(legacyMarkerKey(key), SECURE_STORE_OPTIONS);

    if (marker) {
      // Reintentamos borrar el dato viejo por si la limpieza anterior falló.
      try {
        await legacyStorage.removeItem(key);
      } catch {
        // Sin efecto sobre la sesión actual.
      }
      return null;
    }

    let legacyValue: string | null = null;

    try {
      legacyValue = await legacyStorage.getItem(key);
    } catch {
      legacyValue = null;
    }

    if (legacyValue === null) {
      try {
        await SecureStore.setItemAsync(legacyMarkerKey(key), '1', SECURE_STORE_OPTIONS);
      } catch {
        // Se reintentará en el próximo arranque.
      }
      return null;
    }

    // Migramos una sola vez y borramos la copia sin cifrar.
    await escribir(key, legacyValue);
    return legacyValue;
  }

  async function borrarChunks(key: string, gen: string, cantidad: number): Promise<void> {
    for (let i = 0; i < cantidad; i += 1) {
      try {
        await SecureStore.deleteItemAsync(chunkKey(key, gen, i), SECURE_STORE_OPTIONS);
      } catch {
        // Los chunks huérfanos no pueden leerse sin el manifiesto. No hacemos
        // fallar la operación principal por una limpieza best-effort.
      }
    }
  }

  async function leer(key: string): Promise<string | null> {
    const manifest = await leerManifiesto(key);
    if (!manifest) return migrarLegacy(key);
    if (manifest.chunks === 0) return '';

    let value = '';

    for (let i = 0; i < manifest.chunks; i += 1) {
      const chunk = await SecureStore.getItemAsync(
        chunkKey(key, manifest.gen, i),
        SECURE_STORE_OPTIONS,
      );

      // Un chunk faltante indica una sesión incompleta o corrupta. Devolvemos
      // null para que Firebase pida un login nuevo en lugar de parsear JSON roto.
      if (chunk === null) return null;
      value += chunk;
    }

    return value;
  }

  async function escribir(key: string, value: string): Promise<void> {
    const anterior = await leerManifiesto(key);
    const chunks = partirEnChunks(value, maxChunkBytes);
    const gen = nuevaGeneracion();

    for (let i = 0; i < chunks.length; i += 1) {
      await SecureStore.setItemAsync(chunkKey(key, gen, i), chunks[i], SECURE_STORE_OPTIONS);
    }

    const manifest: Manifest = { v: MANIFEST_VERSION, chunks: chunks.length, gen };

    // El manifiesto se escribe al final: hasta que existe, la sesión anterior
    // (si había) sigue siendo la válida.
    await SecureStore.setItemAsync(
      manifestKey(key),
      JSON.stringify(manifest),
      SECURE_STORE_OPTIONS,
    );

    if (anterior) {
      // Cada generación usa claves de chunk propias, así que hay que borrar
      // todos los chunks anteriores (no sólo los que exceden al nuevo tamaño).
      await borrarChunks(key, anterior.gen, anterior.chunks);
    }

    await limpiarLegacy(key);
  }

  async function borrar(key: string): Promise<void> {
    const manifest = await leerManifiesto(key);

    // Invalidamos primero el manifiesto: si fallara la limpieza de algún chunk,
    // la sesión ya no puede reconstruirse y el logout es efectivo.
    await SecureStore.deleteItemAsync(manifestKey(key), SECURE_STORE_OPTIONS);

    if (manifest) {
      await borrarChunks(key, manifest.gen, manifest.chunks);
    }

    await limpiarLegacy(key);
  }

  return {
    getItem: (key) => enqueue(key, () => leer(key)),
    setItem: (key, value) => enqueue(key, () => escribir(key, value)),
    removeItem: (key) => enqueue(key, () => borrar(key)),
  };
}
