import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { api } from '../../../core/api/client';

import {
  obtenerHistorialAsistencia,
  obtenerHijos,
} from './asistencia-historial.repository';
import { filtrarHijosVinculados } from '../utils/hijos';

jest.mock('../../../core/api/client', () => ({
  api: { get: jest.fn() },
}));

const getMock = api.get as unknown as jest.Mock<
  (url: string, config?: { params?: Record<string, unknown> }) => Promise<{ data: unknown }>
>;

describe('asistencia-historial repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('consulta el historial por alumno y lo ordena por fecha descendente', async () => {
    getMock.mockResolvedValueOnce({
      data: [
        {
          id: 'as-1',
          alumnoId: 'a-1',
          materiaId: 'mat-1',
          fecha: '2026-11-03',
          estado: 'presente',
        },
        {
          id: 'as-2',
          alumnoId: 'a-1',
          materiaId: 'mat-1',
          fecha: '2026-11-09',
          estado: 'ausente',
        },
        {
          id: 'as-3',
          alumnoId: 'a-1',
          materiaId: 'mat-2',
          fecha: '2026-11-05',
          estado: 'TARDE',
        },
      ],
    });

    await expect(obtenerHistorialAsistencia('a-1')).resolves.toEqual([
      {
        id: 'as-2',
        alumnoId: 'a-1',
        materiaId: 'mat-1',
        fecha: '2026-11-09',
        estado: 'ausente',
      },
      {
        id: 'as-3',
        alumnoId: 'a-1',
        materiaId: 'mat-2',
        fecha: '2026-11-05',
        estado: 'tarde',
      },
      {
        id: 'as-1',
        alumnoId: 'a-1',
        materiaId: 'mat-1',
        fecha: '2026-11-03',
        estado: 'presente',
      },
    ]);
    expect(getMock).toHaveBeenCalledWith('/asistencias', {
      params: { alumnoId: 'a-1' },
    });
  });

  it('no consulta el endpoint si falta el alumno', async () => {
    await expect(obtenerHistorialAsistencia('')).rejects.toThrow('Seleccioná un alumno.');
    expect(getMock).not.toHaveBeenCalled();
  });

  it('obtiene los hijos vinculados desde el perfil', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        hijos: [
          {
            id: 'a-1',
            nombre: 'Ana',
            apellido: 'Alvarez',
            nivel: 'primaria',
            legajo: '1001',
          },
          {
            id: 'a-2',
            nombre: 'Bruno',
            apellido: 'Benitez',
            nivel: 'secundaria',
            legajo: null,
          },
        ],
      },
    });

    await expect(obtenerHijos()).resolves.toEqual([
      {
        id: 'a-1',
        nombre: 'Ana',
        apellido: 'Alvarez',
        nivel: 'primaria',
        legajo: '1001',
      },
      {
        id: 'a-2',
        nombre: 'Bruno',
        apellido: 'Benitez',
        nivel: 'secundaria',
        legajo: null,
      },
    ]);
    expect(getMock).toHaveBeenCalledWith('/auth/me');
  });

  it('devuelve lista vacía si el perfil no informa hijos', async () => {
    getMock.mockResolvedValueOnce({ data: {} });

    await expect(obtenerHijos()).resolves.toEqual([]);
  });

  it('filtra los hijos que no pertenecen al perfil', () => {
    const hijos = [
      {
        id: 'a-1',
        nombre: 'Ana',
        apellido: 'Alvarez',
        nivel: 'primaria',
        legajo: '1001',
      },
      {
        id: 'a-2',
        nombre: 'Bruno',
        apellido: 'Benitez',
        nivel: 'secundaria',
        legajo: null,
      },
    ];

    expect(filtrarHijosVinculados(hijos, ['a-2'])).toEqual([hijos[1]]);
    expect(filtrarHijosVinculados(hijos, [])).toEqual([]);
  });
});
