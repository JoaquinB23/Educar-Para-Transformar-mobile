import { describe, expect, it } from '@jest/globals';

import { dniAEmail, dniDesdeEmail } from './dni';

describe('dniAEmail', () => {
  it('arma el mismo correo institucional que usa la web', () => {
    expect(dniAEmail('12345678')).toBe('12345678@escuela.edu.ar');
  });

  it('ignora espacios alrededor o dentro del DNI', () => {
    expect(dniAEmail(' 12345678 ')).toBe('12345678@escuela.edu.ar');
    expect(dniAEmail('12 345 678')).toBe('12345678@escuela.edu.ar');
  });

  it('rechaza valores que no sean sólo dígitos', () => {
    expect(dniAEmail('')).toBe('');
    expect(dniAEmail('12.345.678')).toBe('');
    expect(dniAEmail('1234567a')).toBe('');
  });
});

describe('dniDesdeEmail', () => {
  it('recupera el DNI del correo institucional', () => {
    expect(dniDesdeEmail('12345678@escuela.edu.ar')).toBe('12345678');
  });
});
