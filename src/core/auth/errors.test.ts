import { describe, expect, it } from '@jest/globals';

import { traducirErrorAuth } from './errors';

describe('traducirErrorAuth', () => {
  it.each([
    ['auth/invalid-credential', 'DNI o contraseña incorrectos'],
    ['auth/user-not-found', 'DNI o contraseña incorrectos'],
    ['auth/wrong-password', 'DNI o contraseña incorrectos'],
    ['auth/network-request-failed', 'No se pudo conectar con el servidor. Revisá tu conexión.'],
    ['auth/too-many-requests', 'Demasiados intentos. Esperá unos minutos e intentá nuevamente.'],
    ['auth/user-disabled', 'Esta cuenta está deshabilitada. Contactá a la institución.'],
    [
      'auth/invalid-api-key',
      'El inicio de sesión no está configurado correctamente. Contactá a soporte.',
    ],
  ])('traduce %s', (code, message) => {
    expect(traducirErrorAuth({ code })).toBe(message);
  });

  it('usa un mensaje genérico para errores desconocidos', () => {
    expect(traducirErrorAuth(new Error('boom'))).toBe(
      'No se pudo iniciar sesión. Intentá nuevamente.',
    );
    expect(traducirErrorAuth(null)).toBe('No se pudo iniciar sesión. Intentá nuevamente.');
  });
});
