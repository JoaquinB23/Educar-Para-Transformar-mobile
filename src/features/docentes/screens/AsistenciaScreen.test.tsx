import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ApiError } from '../../../core/api/errors';
import { hoyISO } from '../../../core/utils/fecha';

import { useAsignaciones } from '../hooks/useAsignaciones';
import { useAsistencia, type GuardarAsistenciaVariables } from '../hooks/useAsistencia';
import type {
  AlumnoAsignado,
  AsistenciaGuardada,
  MateriaAsignada,
  ResultadoAsistencia,
} from '../types';

import { AsistenciaScreen } from './AsistenciaScreen';

jest.mock('../hooks/useAsignaciones', () => ({
  useAsignaciones: jest.fn(),
}));

jest.mock('../hooks/useAsistencia', () => ({
  useAsistencia: jest.fn(),
}));

type ConsultaAsignaciones = ReturnType<typeof useAsignaciones>;
type ConsultaAsistencia = ReturnType<typeof useAsistencia>;

const asignacionesMock = useAsignaciones as jest.MockedFunction<typeof useAsignaciones>;
const asistenciaMock = useAsistencia as jest.MockedFunction<typeof useAsistencia>;

const ANA: AlumnoAsignado = {
  id: 'a-1',
  nombre: 'Ana',
  apellido: 'Alvarez',
  legajo: '1001',
  nivel: 'secundaria',
  estado: 'activo',
};

const BRUNO: AlumnoAsignado = {
  id: 'a-2',
  nombre: 'Bruno',
  apellido: 'Benitez',
  legajo: '1002',
  nivel: 'secundaria',
  estado: 'activo',
};

const CARLA: AlumnoAsignado = {
  id: 'a-3',
  nombre: 'Carla',
  apellido: 'Costa',
  legajo: '1003',
  nivel: 'secundaria',
  estado: 'activo',
};

const MATERIA: MateriaAsignada = {
  id: 'mat-1',
  codigo: 'MAT',
  nombre: 'Matemática',
  nivel: 'secundaria',
  alumnos: [ANA, BRUNO, CARLA],
};

interface OpcionesAsignaciones {
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  data?: MateriaAsignada[];
}

type RefetchAsistencia = () => Promise<unknown>;

type MutarAsistencia = (
  variables: GuardarAsistenciaVariables,
  opciones?: { onSuccess?: () => void },
) => void;

interface OpcionesConsultaAsistencia {
  data?: AsistenciaGuardada[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: jest.Mock<RefetchAsistencia>;
}

interface OpcionesMutacion {
  mutate?: jest.Mock<MutarAsistencia>;
  isPending?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  error?: unknown;
  data?: ResultadoAsistencia;
  variables?: GuardarAsistenciaVariables;
}

interface OpcionesAsistencia {
  consulta?: OpcionesConsultaAsistencia;
  mutacion?: OpcionesMutacion;
}

function configurarAsignaciones(opciones: OpcionesAsignaciones = {}) {
  const refetch = jest.fn(async () => ({}));

  asignacionesMock.mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: [MATERIA],
    refetch,
    ...opciones,
  } as unknown as ConsultaAsignaciones);

  return refetch;
}

function configurarAsistencia(opciones: OpcionesAsistencia = {}) {
  const refetch = opciones.consulta?.refetch ?? jest.fn(async () => ({}));
  const mutate = opciones.mutacion?.mutate ?? jest.fn();

  asistenciaMock.mockReturnValue({
    consulta: {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch,
      ...opciones.consulta,
    },
    mutacion: {
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      variables: undefined,
      ...opciones.mutacion,
      mutate,
    },
  } as unknown as ConsultaAsistencia);

  return { refetch, mutate };
}

function resultadoCon(registros: GuardarAsistenciaVariables['registros']): ResultadoAsistencia {
  return {
    registros: registros.map((registro, indice) => ({
      id: `as-${indice}`,
      materiaId: 'mat-1',
      fecha: hoyISO(),
      ...registro,
    })),
    descartados: [],
    avisos: { generadas: 0, sinTutor: [] },
  };
}

describe('AsistenciaScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra la carga y el error de las materias asignadas', async () => {
    configurarAsignaciones({ isLoading: true });
    configurarAsistencia();

    await render(<AsistenciaScreen />);
    expect(screen.getByLabelText('Cargando')).toBeTruthy();
  });

  it('permite reintentar la carga de materias', async () => {
    const refetch = configurarAsignaciones({
      isError: true,
      error: new Error('No se pudieron cargar las materias'),
    });
    configurarAsistencia();

    await render(<AsistenciaScreen />);

    expect(screen.getByText('No se pudieron cargar las materias')).toBeTruthy();
    await fireEvent.press(screen.getByText('Reintentar'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('avisa cuando no hay materias asignadas', async () => {
    configurarAsignaciones({ data: [] });
    configurarAsistencia();

    await render(<AsistenciaScreen />);

    expect(screen.getByText('No tenés materias asignadas.')).toBeTruthy();
  });

  it('avisa cuando la materia no tiene alumnos y no permite guardar', async () => {
    configurarAsignaciones({ data: [{ ...MATERIA, alumnos: [] }] });
    const { mutate } = configurarAsistencia();

    await render(<AsistenciaScreen />);

    expect(screen.getByText('La materia no tiene alumnos inscriptos.')).toBeTruthy();
    expect(
      screen.getByLabelText('Guardar asistencia').props.accessibilityState.disabled,
    ).toBe(true);

    await fireEvent.press(screen.getByLabelText('Guardar asistencia'));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('marca presente por defecto a todos los alumnos', async () => {
    configurarAsignaciones();
    configurarAsistencia();

    await render(<AsistenciaScreen />);

    expect(
      screen.getByLabelText('Ana Alvarez: Presente').props.accessibilityState.selected,
    ).toBe(true);
    expect(
      screen.getByLabelText('Bruno Benitez: Presente').props.accessibilityState.selected,
    ).toBe(true);
    expect(
      screen.getByLabelText('Carla Costa: Presente').props.accessibilityState.selected,
    ).toBe(true);
  });

  it('envía ausentes, tardanzas y deja presentes a los alumnos sin marcar', async () => {
    configurarAsignaciones();
    const { mutate } = configurarAsistencia();

    await render(<AsistenciaScreen />);

    await fireEvent.press(screen.getByLabelText('Ana Alvarez: Ausente'));
    await fireEvent.press(screen.getByLabelText('Bruno Benitez: Tarde'));
    await fireEvent.press(screen.getByLabelText('Guardar asistencia'));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]?.[0]).toEqual({
      materiaId: 'mat-1',
      fecha: hoyISO(),
      registros: [
        { alumnoId: 'a-1', estado: 'ausente' },
        { alumnoId: 'a-2', estado: 'tarde' },
        { alumnoId: 'a-3', estado: 'presente' },
      ],
    });
  });

  it('muestra los registros guardados, descartados y tutores sin aviso', async () => {
    configurarAsignaciones();
    const mutate = jest.fn(
      (_variables: GuardarAsistenciaVariables, opciones?: { onSuccess?: () => void }) => {
        opciones?.onSuccess?.();
      },
    );
    configurarAsistencia({ mutacion: { mutate } });

    const { rerender } = await render(<AsistenciaScreen />);
    await fireEvent.press(screen.getByLabelText('Guardar asistencia'));

    const variables = mutate.mock.calls[0]?.[0] as GuardarAsistenciaVariables;
    configurarAsistencia({
      mutacion: {
        mutate,
        isSuccess: true,
        data: {
          ...resultadoCon(variables.registros),
          descartados: [{ registro: {}, motivo: 'estado inválido' }],
          avisos: { generadas: 1, sinTutor: ['a-3'] },
        },
        variables,
      },
    });
    await rerender(<AsistenciaScreen />);

    expect(screen.getByText(/Asistencia guardada: 3 registros/)).toBeTruthy();
    expect(screen.getByText(/1 registro descartado por el servidor/)).toBeTruthy();
    expect(
      screen.getByText(/1 alumno sin tutor vinculado: no se pudo enviar el aviso/),
    ).toBeTruthy();
  });

  it('muestra el error de guardado y permite reintentar', async () => {
    configurarAsignaciones();
    const { mutate } = configurarAsistencia({
      mutacion: {
        isError: true,
        error: new ApiError(0, 'sin conexión'),
        variables: {
          materiaId: 'mat-1',
          fecha: hoyISO(),
          registros: [
            { alumnoId: 'a-1', estado: 'presente' },
            { alumnoId: 'a-2', estado: 'presente' },
            { alumnoId: 'a-3', estado: 'presente' },
          ],
        },
      },
    });

    await render(<AsistenciaScreen />);

    expect(
      screen.getByText('Sin conexión. Revisá tu red e intentá de nuevo'),
    ).toBeTruthy();

    await fireEvent.press(screen.getByText('Reintentar'));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('no permite guardar mientras la asistencia existente está cargando', async () => {
    configurarAsignaciones();
    const { mutate } = configurarAsistencia({ consulta: { isLoading: true } });

    await render(<AsistenciaScreen />);

    expect(
      screen.getByLabelText('Guardar asistencia').props.accessibilityState.disabled,
    ).toBe(true);

    await fireEvent.press(screen.getByLabelText('Guardar asistencia'));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('no permite guardar si falló la consulta de asistencia y permite reintentarla', async () => {
    configurarAsignaciones();
    const refetch = jest.fn(async () => ({}));
    const { mutate } = configurarAsistencia({
      consulta: {
        isError: true,
        error: new Error('No se pudo cargar la asistencia'),
        refetch,
      },
    });

    await render(<AsistenciaScreen />);

    expect(screen.getByText('No se pudo cargar la asistencia')).toBeTruthy();
    expect(
      screen.getByLabelText('Guardar asistencia').props.accessibilityState.disabled,
    ).toBe(true);

    await fireEvent.press(screen.getByLabelText('Guardar asistencia'));
    expect(mutate).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText('Reintentar'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('oculta el mensaje de éxito si el docente vuelve a editar', async () => {
    configurarAsignaciones();
    const mutate = jest.fn((_variables: GuardarAsistenciaVariables, opciones?: { onSuccess?: () => void }) => {
      opciones?.onSuccess?.();
    });
    configurarAsistencia({ mutacion: { mutate } });

    const { rerender } = await render(<AsistenciaScreen />);

    await fireEvent.press(screen.getByLabelText('Guardar asistencia'));

    const variables = mutate.mock.calls[0]?.[0] as GuardarAsistenciaVariables;
    configurarAsistencia({
      mutacion: {
        mutate,
        isSuccess: true,
        data: resultadoCon(variables.registros),
        variables,
      },
    });
    await rerender(<AsistenciaScreen />);

    expect(screen.getByText(/Asistencia guardada: 3 registros/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Ana Alvarez: Ausente'));

    expect(screen.queryByText(/Asistencia guardada: 3 registros/)).toBeNull();
  });
});
