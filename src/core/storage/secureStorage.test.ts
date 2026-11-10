import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';

import { crearSecureStorage } from './secureStorage';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();

  return {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
    __store: store,
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

const store = (SecureStore as unknown as { __store: Map<string, string> }).__store;

function bytesUtf8(value: string): number {
  let bytes = 0;

  for (const char of value) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint <= 0x7f) bytes += 1;
    else if (codePoint <= 0x7ff) bytes += 2;
    else if (codePoint <= 0xffff) bytes += 3;
    else bytes += 4;
  }

  return bytes;
}

function chunkKeys(): string[] {
  return [...store.keys()].filter((key) => !key.endsWith('.m') && !key.endsWith('.legacy'));
}

function crearLegacy(initial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(initial));

  return {
    datos,
    getItem: jest.fn(async (key: string) => datos.get(key) ?? null),
    removeItem: jest.fn(async (key: string) => {
      datos.delete(key);
    }),
  };
}

describe('crearSecureStorage', () => {
  beforeEach(() => {
    store.clear();

    jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => store.get(key) ?? null);
    jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => {
      store.set(key, value);
    });
    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
      store.delete(key);
    });
  });

  it('guarda, lee y elimina un valor', async () => {
    const storage = crearSecureStorage();

    await storage.setItem('clave', 'valor');
    expect(await storage.getItem('clave')).toBe('valor');

    await storage.removeItem('clave');
    expect(await storage.getItem('clave')).toBeNull();
    expect(store.size).toBe(0);
  });

  it('codifica claves con caracteres que SecureStore no admite', async () => {
    const storage = crearSecureStorage();

    await storage.setItem('firebase:authUser:abc:[DEFAULT]', 'sesion');

    expect(store.has('firebase:authUser:abc:[DEFAULT]')).toBe(false);
    expect([...store.keys()].every((key) => /^[A-Za-z0-9._-]+$/.test(key))).toBe(true);
    expect(await storage.getItem('firebase:authUser:abc:[DEFAULT]')).toBe('sesion');
  });

  it('fragmenta valores grandes y respeta el límite por chunk', async () => {
    const storage = crearSecureStorage(100);
    const value = 'a'.repeat(250);

    await storage.setItem('k', value);

    const chunks = chunkKeys();
    expect(chunks).toHaveLength(3);
    for (const key of chunks) {
      expect(bytesUtf8(store.get(key) ?? '')).toBeLessThanOrEqual(100);
    }
    expect(await storage.getItem('k')).toBe(value);
  });

  it('fragmenta sin romper caracteres multibyte', async () => {
    const storage = crearSecureStorage(10);
    const value = 'áéíóú😀'.repeat(40);

    await storage.setItem('unicode', value);

    for (const key of chunkKeys()) {
      expect(bytesUtf8(store.get(key) ?? '')).toBeLessThanOrEqual(10);
    }
    expect(await storage.getItem('unicode')).toBe(value);
  });

  it('soporta el valor vacío', async () => {
    const storage = crearSecureStorage();

    await storage.setItem('vacio', '');

    expect(await storage.getItem('vacio')).toBe('');
  });

  it('elimina los chunks de la generación anterior al sobrescribir', async () => {
    const storage = crearSecureStorage(50);

    await storage.setItem('k', 'a'.repeat(220));
    const anteriores = new Set(chunkKeys());

    await storage.setItem('k', 'b');

    const actuales = chunkKeys();
    expect(actuales).toHaveLength(1);
    expect(actuales.every((key) => !anteriores.has(key))).toBe(true);
    expect(await storage.getItem('k')).toBe('b');
  });

  it('devuelve null si falta un chunk (sesión corrupta)', async () => {
    const storage = crearSecureStorage(50);

    await storage.setItem('k', 'a'.repeat(120));
    const [primerChunk] = chunkKeys();
    store.delete(primerChunk);

    expect(await storage.getItem('k')).toBeNull();
  });

  it('devuelve null si el manifiesto es inválido', async () => {
    const storage = crearSecureStorage();

    await storage.setItem('k', 'x');
    const manifiesto = [...store.keys()].find((key) => key.endsWith('.m'));

    if (manifiesto) store.set(manifiesto, 'no-es-json');

    expect(await storage.getItem('k')).toBeNull();
  });

  it('el logout es efectivo aunque falle la limpieza de un chunk', async () => {
    const storage = crearSecureStorage(50);

    await storage.setItem('k', 'a'.repeat(120));

    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
      if (!key.endsWith('.m')) {
        throw new Error('fallo al borrar chunk');
      }

      store.delete(key);
    });

    await expect(storage.removeItem('k')).resolves.toBeUndefined();
    expect(await storage.getItem('k')).toBeNull();
  });

  it('serializa escrituras concurrentes de la misma clave', async () => {
    const storage = crearSecureStorage(20);

    const primera = storage.setItem('k', 'a'.repeat(50));
    const segunda = storage.setItem('k', 'b');

    await Promise.all([primera, segunda]);

    expect(await storage.getItem('k')).toBe('b');
  });

  it('soporta el chequeo de disponibilidad que hace Firebase', async () => {
    const storage = crearSecureStorage();

    await storage.setItem('firebase:authUser:__available__', '1');
    await storage.removeItem('firebase:authUser:__available__');

    expect(store.size).toBe(0);
  });

  it('migra la sesión heredada de AsyncStorage y borra la copia sin cifrar', async () => {
    const key = 'firebase:authUser:abc:[DEFAULT]';
    const legacy = crearLegacy({ [key]: 'usuario-serializado' });
    const storage = crearSecureStorage(undefined, legacy);

    expect(await storage.getItem(key)).toBe('usuario-serializado');
    expect(legacy.datos.has(key)).toBe(false);
    expect(await storage.getItem(key)).toBe('usuario-serializado');
  });

  it('fragmenta la sesión heredada si supera el límite por chunk', async () => {
    const legacy = crearLegacy({ k: 'a'.repeat(250) });
    const storage = crearSecureStorage(100, legacy);

    expect(await storage.getItem('k')).toBe('a'.repeat(250));
    expect(chunkKeys()).toHaveLength(3);
  });

  it('no consulta AsyncStorage en cada arranque si no hay sesión heredada', async () => {
    const legacy = crearLegacy();
    const storage = crearSecureStorage(undefined, legacy);

    expect(await storage.getItem('k')).toBeNull();
    expect(await storage.getItem('k')).toBeNull();
    expect(legacy.getItem).toHaveBeenCalledTimes(1);
  });

  it('el logout borra la sesión heredada y evita que reaparezca', async () => {
    const key = 'firebase:authUser:abc:[DEFAULT]';
    const legacy = crearLegacy({ [key]: 'viejo' });
    const storage = crearSecureStorage(undefined, legacy);

    await storage.removeItem(key);

    expect(legacy.datos.has(key)).toBe(false);
    expect(await storage.getItem(key)).toBeNull();
  });

  it('al guardar una sesión nueva descarta la copia heredada', async () => {
    const legacy = crearLegacy({ k: 'viejo' });
    const storage = crearSecureStorage(undefined, legacy);

    await storage.setItem('k', 'nuevo');

    expect(legacy.datos.has('k')).toBe(false);
    expect(await storage.getItem('k')).toBe('nuevo');
  });

  it('no revive la sesión heredada si falla el borrado de AsyncStorage', async () => {
    const key = 'firebase:authUser:abc:[DEFAULT]';
    const legacy = crearLegacy({ [key]: 'viejo' });
    legacy.removeItem.mockRejectedValue(new Error('fallo de AsyncStorage'));

    const storage = crearSecureStorage(undefined, legacy);

    await storage.removeItem(key);

    expect(await storage.getItem(key)).toBeNull();
  });
});
