import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { useSession } from '../../../core/auth/session';
import { ROLES, type Perfil } from '../../../core/auth/types';

import { useHijos } from '../hooks/useHijos';
import { useHistorialAsistencia } from '../hooks/useHistorialAsistencia';
import type { AsistenciaHistorial, HijoVinculado } from '../types';

import { AsistenciaHistorialScreen } from './AsistenciaHistorialScreen';

jest.mock('../../../core/auth/session', () => ({
  useSession: jest.fn(),
}));

jest.mock('../hooks/useHijos', () => ({
  useHijos: jest.fn(),
}));

jest.mock('../hooks/useHistorialAsistencia', () => ({
  useHistorialAsistencia: jest.fn(),
}));

type SesionMock = ReturnType<typeof useSession>;
type HistorialMock = ReturnType<typeof useHistorialAsistencia>;
type HijosMock = ReturnType<typeof useHijos>;

const sessionMock = useSession as jest.MockedFunction<typeof useSession>;
const historialMock = useHistorialAsistencia as jest.MockedFunction<
  typeof useHistorialAsistencia
>;
const hijosMock = useHijos as jest.MockedFunction<typeof useHijos>;

const ANA: HijoVinculado = {
  id: 'a-1',
  nombre: 'Ana',
  apellido: 'Alvarez',
  nivel: 'primaria',
  legajo: '1001',
};

const BRUNO: HijoVinculado = {
  id: 'a-2',
  nombre: 'Bruno',
  apellido: 'Benitez',
  nivel: 'secundaria',
  legajo: null,
};

const HISTORIAL: AsistenciaHistorial[] = [
  {
    id: 'as-1',
    alumnoId: 'a-1',
    materiaId: 'mat-1',
    fecha: '2026-11-09',
    estado: 'ausente',
  },
  {
    id: 'as-2',
    alumnoId: 'a-1',
    materiaId: 'mat-1',
    fecha: '2026-11-06',
    estado: 'tarde',
  },
  {
    id: 'as-3',
    alumnoId: 'a-1',
    materiaId: 'mat-1',
    fecha: '2026-11-05',
    estado: 'presente',
  },
];

const PERFIL_ALUMNO: Perfil = {
  id: 'u-1',
  nombre: 'Ana Alvarez',
  email: 'ana@example.test',
  rol: ROLES.ALUMNO,
  alumnoId: 'a-1',
  hijoIds: [],
};

const PERFIL_PADRE: Perfil = {
  id: 'u-2',
  nombre: 'Tutor',
  email: 'tutor@example.test',
  rol: ROLES.PADRE,
  hijoIds: ['a-1', 'a-2'],
};

interface OpcionesHistorial {
  data?: AsistenciaHistorial[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  isRefetching?: boolean;
  refetch?: jest.Mock<() => Promise<unknown>>;
}

interface OpcionesHijos {
  data?: HijoVinculado[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: jest.Mock<() => Promise<unknown>>;
}

function configurarSesion(perfil: Perfil | null) {
  sessionMock.mockReturnValue({
    status: perfil ? 'autenticado' : 'anonimo',
    perfil,
    error: null,
    inicializado: true,
    iniciarSesion: jest.fn(async () => {}),
    cerrarSesion: jest.fn(async () => {}),
  } as unknown as SesionMock);
}

function configurarHistorial(opciones: OpcionesHistorial = {}) {
  const refetch = opciones.refetch ?? jest.fn(async () => ({}));

  historialMock.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    isRefetching: false,
    refetch,
    ...opciones,
  } as unknown as HistorialMock);

  return { refetch };
}

function configurarHijos(opciones: OpcionesHijos = {}) {
  const refetch = opciones.refetch ?? jest.fn(async () => ({}));

  hijosMock.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch,
    ...opciones,
  } as unknown as HijosMock);

  return { refetch };
}

describe('AsistenciaHistorialScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    configurarSesion(PERFIL_ALUMNO);
    configurarHistorial();
    configurarHijos();
  });

  it('muestra la carga del historial', async () => {
    configurarHistorial({ data: undefined, isLoading: true });

    await render(<AsistenciaHistorialScreen />);

    expect(screen.getByLabelText('Cargando')).toBeTruthy();
  });

  it('muestra el error del historial y permite reintentar', async () => {
    const refetch = jest.fn(async () => ({}));
    configurarHistorial({
      data: undefined,
      isError: true,
      error: new Error('No se pudo cargar la asistencia'),
      refetch,
    });

    await render(<AsistenciaHistorialScreen />);

    expect(screen.getByText('No se pudo cargar la asistencia')).toBeTruthy();

    await fireEvent.press(screen.getByText('Reintentar'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('muestra el vacío cuando no hay registros', async () => {
    configurarHistorial({ data: [] });

    await render(<AsistenciaHistorialScreen />);

    expect(
      screen.getByText('No hay registros de asistencia para mostrar.'),
    ).toBeTruthy();
  });

  it('lista el historial del alumno con fecha y estado', async () => {
    configurarHistorial({ data: HISTORIAL });

    await render(<AsistenciaHistorialScreen />);

    expect(historialMock).toHaveBeenCalledWith('a-1');
    expect(screen.getByText('lun 9 nov 2026')).toBeTruthy();
    expect(screen.getByText('Ausente')).toBeTruthy();
    expect(screen.getByText('Tarde')).toBeTruthy();
    expect(screen.getByText('Presente')).toBeTruthy();
    expect(screen.queryByText('Elegí un hijo para ver su asistencia.')).toBeNull();
  });

  it('avisa si la cuenta de alumno no está vinculada', async () => {
    configurarSesion({ ...PERFIL_ALUMNO, alumnoId: undefined });

    await render(<AsistenciaHistorialScreen />);

    expect(
      screen.getByText('Tu cuenta todavía no está vinculada a un registro de alumno.'),
    ).toBeTruthy();
  });

  it('no muestra la pantalla a roles no habilitados', async () => {
    configurarSesion({ ...PERFIL_ALUMNO, rol: ROLES.PROFESOR, alumnoId: undefined });

    await render(<AsistenciaHistorialScreen />);

    expect(
      screen.getByText('Esta sección está disponible para alumnos y familias.'),
    ).toBeTruthy();
  });

  it('el padre elige entre sus hijos y consulta el seleccionado', async () => {
    configurarSesion(PERFIL_PADRE);
    configurarHijos({ data: [ANA, BRUNO] });
    configurarHistorial({ data: [] });

    await render(<AsistenciaHistorialScreen />);

    expect(screen.getByText('Elegí un hijo para ver su asistencia.')).toBeTruthy();
    expect(
      screen.getByLabelText('Seleccionar Ana Alvarez (Primaria)'),
    ).toBeTruthy();
    expect(
      screen.getByLabelText('Seleccionar Bruno Benitez (Secundaria)'),
    ).toBeTruthy();
    expect(historialMock).toHaveBeenLastCalledWith('a-1');
    expect(
      screen.getByLabelText('Seleccionar Ana Alvarez (Primaria)').props
        .accessibilityState.selected,
    ).toBe(true);

    await fireEvent.press(
      screen.getByLabelText('Seleccionar Bruno Benitez (Secundaria)'),
    );

    expect(historialMock).toHaveBeenLastCalledWith('a-2');
  });

  it('solo ofrece los hijos declarados en el perfil', async () => {
    configurarSesion({ ...PERFIL_PADRE, hijoIds: ['a-1'] });
    configurarHijos({ data: [ANA, BRUNO] });

    await render(<AsistenciaHistorialScreen />);

    expect(screen.getByLabelText('Seleccionar Ana Alvarez (Primaria)')).toBeTruthy();
    expect(screen.queryByText(/Bruno Benitez/)).toBeNull();
  });

  it('muestra la carga de los hijos del padre', async () => {
    configurarSesion(PERFIL_PADRE);
    configurarHijos({ data: undefined, isLoading: true });

    await render(<AsistenciaHistorialScreen />);

    expect(screen.getByLabelText('Cargando')).toBeTruthy();
  });

  it('muestra el error de los hijos y permite reintentar', async () => {
    const refetch = jest.fn(async () => ({}));
    configurarSesion(PERFIL_PADRE);
    configurarHijos({
      data: undefined,
      isError: true,
      error: new Error('No se pudieron cargar los hijos'),
      refetch,
    });

    await render(<AsistenciaHistorialScreen />);

    expect(screen.getByText('No se pudieron cargar los hijos')).toBeTruthy();

    await fireEvent.press(screen.getByText('Reintentar'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('avisa cuando el padre no tiene hijos vinculados', async () => {
    configurarSesion(PERFIL_PADRE);
    configurarHijos({ data: [] });

    await render(<AsistenciaHistorialScreen />);

    expect(screen.getByText('No tenés hijos vinculados.')).toBeTruthy();
  });

  it('vuelve a consultar al hacer pull-to-refresh', async () => {
    const refetch = jest.fn(async () => ({}));
    configurarHistorial({ data: HISTORIAL, refetch });

    await render(<AsistenciaHistorialScreen />);

    const lista = screen.getByTestId('asistencia-historial-lista');

    await act(async () => {
      await lista.props.refreshControl.props.onRefresh();
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
