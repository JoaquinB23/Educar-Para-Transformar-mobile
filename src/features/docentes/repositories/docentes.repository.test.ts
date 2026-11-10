import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { api } from '../../../core/api/client';

import {
  agruparPorMateria,
  combinarAsignaciones,
  filtrarMateriasDelDocente,
  guardarAsistencia,
  obtenerAsignaciones,
  obtenerAsistencias,
} from './docentes.repository';

jest.mock('../../../core/api/client', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const getMock = api.get as unknown as jest.Mock<
  (url: string, config?: { params?: Record<string, unknown> }) => Promise<{ data: unknown }>
>;

const postMock = api.post as unknown as jest.Mock<
  (url: string, payload: unknown) => Promise<{ data: unknown }>
>;

const MATERIAS = [
  {
    id: 'mat-1',
    codigo: 'MAT',
    nombre: 'Matemática',
    nivel: 'secundaria',
    docenteId: 'doc-1',
    cicloLectivo: 2026,
  },
  {
    id: 'mat-2',
    codigo: 'HIS',
    nombre: 'Historia',
    nivel: 'secundaria',
    docenteId: 'doc-1',
    cicloLectivo: 2026,
  },
  {
    id: 'mat-3',
    codigo: 'FIS',
    nombre: 'Física',
    nivel: 'secundaria',
    docenteId: 'doc-2',
    cicloLectivo: 2026,
  },
];

const MATEMATICA = { id: 'mat-1', codigo: 'MAT', nombre: 'Matemática', nivel: 'secundaria' };
const HISTORIA = { id: 'mat-2', codigo: 'HIS', nombre: 'Historia', nivel: 'secundaria' };

const ALUMNOS = [
  {
    id: 'a-1',
    nombre: 'Ana',
    apellido: 'Alvarez',
    legajo: '1001',
    nivel: 'secundaria',
    estado: 'activo',
    materias: [MATEMATICA],
  },
  {
    id: 'a-2',
    nombre: 'Bruno',
    apellido: 'Benitez',
    legajo: '1002',
    nivel: 'secundaria',
    estado: 'activo',
    materias: [MATEMATICA],
  },
];

const ALUMNO_HISTORIA = {
  id: 'a-3',
  nombre: 'Carla',
  apellido: 'Costa',
  legajo: '1003',
  nivel: 'secundaria',
  estado: 'activo',
  materias: [HISTORIA],
};

describe('obtenerAsignaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra solo las materias propias, incluidas las que no tienen alumnos', async () => {
    getMock
      .mockResolvedValueOnce({ data: { docenteId: 'doc-1', cicloLectivoActual: 2026 } })
      .mockResolvedValueOnce({ data: MATERIAS })
      .mockResolvedValueOnce({ data: ALUMNOS });

    const asignaciones = await obtenerAsignaciones();

    expect(asignaciones.map((materia) => materia.id)).toEqual(['mat-2', 'mat-1']);
    expect(asignaciones.some((materia) => materia.id === 'mat-3')).toBe(false);

    const matematica = asignaciones.find((materia) => materia.id === 'mat-1');
    expect(matematica?.alumnos.map((alumno) => alumno.apellido)).toEqual([
      'Alvarez',
      'Benitez',
    ]);

    const historia = asignaciones.find((materia) => materia.id === 'mat-2');
    expect(historia?.alumnos).toEqual([]);
  });

  it('consulta las materias del ciclo lectivo actual', async () => {
    getMock
      .mockResolvedValueOnce({ data: { docenteId: 'doc-1', cicloLectivoActual: 2026 } })
      .mockResolvedValueOnce({ data: MATERIAS })
      .mockResolvedValueOnce({ data: ALUMNOS });

    await obtenerAsignaciones();

    expect(getMock).toHaveBeenNthCalledWith(2, '/materias', {
      params: { cicloLectivo: 2026 },
    });
    expect(getMock).toHaveBeenNthCalledWith(3, '/docentes/alumnos');
  });

  it('informa cuando la cuenta no está vinculada a un docente', async () => {
    getMock.mockResolvedValueOnce({ data: { docenteId: null, cicloLectivoActual: 2026 } });

    await expect(obtenerAsignaciones()).rejects.toThrow(
      'La cuenta no está vinculada a un registro de docente',
    );
    expect(getMock).toHaveBeenCalledTimes(1);
  });
});

describe('filtrarMateriasDelDocente', () => {
  it('descarta las materias asignadas a otros docentes', () => {
    expect(filtrarMateriasDelDocente(MATERIAS, 'doc-1').map((materia) => materia.id)).toEqual([
      'mat-1',
      'mat-2',
    ]);
  });

  it('no devuelve materias si el perfil no trae docenteId', () => {
    expect(filtrarMateriasDelDocente(MATERIAS, null)).toEqual([]);
    expect(filtrarMateriasDelDocente(MATERIAS, undefined)).toEqual([]);
  });
});

describe('combinarAsignaciones', () => {
  it('incluye materias vacías y materias que solo vienen del endpoint de alumnos', () => {
    const asignadas = filtrarMateriasDelDocente(MATERIAS, 'doc-1');
    const alumnoArte = {
      id: 'a-3',
      nombre: 'Carla',
      apellido: 'Costa',
      materias: [{ id: 'mat-9', codigo: 'ART', nombre: 'Arte', nivel: 'secundaria' }],
    };

    const resultado = combinarAsignaciones(asignadas, [...ALUMNOS, alumnoArte]);

    expect(resultado.map((materia) => materia.id)).toEqual(['mat-9', 'mat-2', 'mat-1']);
    expect(resultado.find((materia) => materia.id === 'mat-1')?.alumnos).toHaveLength(2);
    expect(resultado.find((materia) => materia.id === 'mat-2')?.alumnos).toEqual([]);
    expect(resultado.find((materia) => materia.id === 'mat-9')?.alumnos).toHaveLength(1);
  });
});

describe('agruparPorMateria', () => {
  it('agrupa sin duplicar alumnos y ordena por apellido y nombre', () => {
    const agrupadas = agruparPorMateria([...ALUMNOS, ALUMNO_HISTORIA, ALUMNOS[0]]);

    expect(agrupadas.map((materia) => materia.id)).toEqual(['mat-2', 'mat-1']);
    expect(
      agrupadas
        .find((materia) => materia.id === 'mat-1')
        ?.alumnos.map((alumno) => alumno.apellido),
    ).toEqual(['Alvarez', 'Benitez']);
  });
});

describe('asistencias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('consulta la asistencia de una materia y fecha', async () => {
    const registros = [
      {
        id: 'as-1',
        alumnoId: 'a-1',
        materiaId: 'mat-1',
        fecha: '2026-11-09',
        estado: 'ausente',
      },
    ];
    getMock.mockResolvedValueOnce({ data: registros });

    await expect(obtenerAsistencias('mat-1', '2026-11-09')).resolves.toEqual(registros);
    expect(getMock).toHaveBeenCalledWith('/asistencias', {
      params: { materiaId: 'mat-1', fecha: '2026-11-09' },
    });
  });

  it('envía el registro completo de asistencia al endpoint', async () => {
    const payload = {
      materiaId: 'mat-1',
      fecha: '2026-11-09',
      registros: [
        { alumnoId: 'a-1', estado: 'ausente' as const },
        { alumnoId: 'a-2', estado: 'presente' as const },
      ],
    };
    const resultado = {
      registros: payload.registros.map((registro, indice) => ({
        id: `as-${indice}`,
        materiaId: payload.materiaId,
        fecha: payload.fecha,
        ...registro,
      })),
      descartados: [],
      avisos: { generadas: 1, sinTutor: [] },
    };
    postMock.mockResolvedValueOnce({ data: resultado });

    await expect(guardarAsistencia(payload)).resolves.toEqual(resultado);
    expect(postMock).toHaveBeenCalledWith('/asistencias', payload);
  });
});
