import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useFocusEffect } from 'expo-router';

import { useAsignaciones } from '../hooks/useAsignaciones';
import type { MateriaAsignada } from '../types';

import { MateriasScreen } from './MateriasScreen';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../hooks/useAsignaciones', () => ({
  useAsignaciones: jest.fn(),
}));

interface OpcionesConsulta {
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  data?: MateriaAsignada[];
}

const consultaMock = useAsignaciones as jest.MockedFunction<typeof useAsignaciones>;
const focusEffectMock = useFocusEffect as jest.MockedFunction<typeof useFocusEffect>;

const MATEMATICA: MateriaAsignada = {
  id: 'mat-1',
  codigo: 'MAT',
  nombre: 'Matemática',
  nivel: 'secundaria',
  alumnos: [
    {
      id: 'a-1',
      nombre: 'Ana',
      apellido: 'Alvarez',
      legajo: '1001',
      nivel: 'secundaria',
      estado: 'activo',
    },
  ],
};

const HISTORIA: MateriaAsignada = {
  id: 'mat-2',
  codigo: 'HIS',
  nombre: 'Historia',
  nivel: 'secundaria',
  alumnos: [],
};

function configurarConsulta(opciones: OpcionesConsulta = {}) {
  const refetch = jest.fn(async () => ({}));

  consultaMock.mockReturnValue({
    isLoading: false,
    isError: false,
    error: null,
    data: [],
    refetch,
    ...opciones,
  } as unknown as ReturnType<typeof useAsignaciones>);

  return refetch;
}

describe('MateriasScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el estado de carga', async () => {
    configurarConsulta({ isLoading: true });

    await render(<MateriasScreen />);

    expect(screen.getByLabelText('Cargando')).toBeTruthy();
  });

  it('muestra el error y permite reintentar', async () => {
    const refetch = configurarConsulta({ isError: true, error: new Error('Falló la carga') });

    await render(<MateriasScreen />);

    expect(screen.getByText('Falló la carga')).toBeTruthy();

    await fireEvent.press(screen.getByText('Reintentar'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('informa cuando el docente no tiene asignaciones', async () => {
    configurarConsulta();

    await render(<MateriasScreen />);

    expect(screen.getByText('No tenés materias asignadas.')).toBeTruthy();
  });

  it('lista materias, niveles y cantidad de alumnos', async () => {
    configurarConsulta({ data: [MATEMATICA, HISTORIA] });

    await render(<MateriasScreen />);

    expect(screen.getByText('Matemática')).toBeTruthy();
    expect(screen.getByText('MAT · Nivel Secundaria')).toBeTruthy();
    expect(screen.getByText('1 alumno')).toBeTruthy();
    expect(screen.getByText('Historia')).toBeTruthy();
    expect(screen.getByText('0 alumnos')).toBeTruthy();
  });

  it('muestra el listado de alumnos al expandir una materia', async () => {
    configurarConsulta({ data: [MATEMATICA] });

    await render(<MateriasScreen />);

    await fireEvent.press(screen.getByText('Matemática'));

    expect(screen.getByText('Ana Alvarez')).toBeTruthy();
    expect(screen.getByText('Legajo 1001')).toBeTruthy();

    await fireEvent.press(screen.getByText('Matemática'));

    expect(screen.queryByText('Ana Alvarez')).toBeNull();
  });

  it('avisa cuando la materia no tiene alumnos inscriptos', async () => {
    configurarConsulta({ data: [HISTORIA] });

    await render(<MateriasScreen />);

    await fireEvent.press(screen.getByText('Historia'));

    expect(screen.getByText('No hay alumnos inscriptos en esta materia.')).toBeTruthy();
  });

  it('vuelve a consultar al recuperar el foco, sin duplicar la carga inicial', async () => {
    const refetch = configurarConsulta({ data: [MATEMATICA] });

    await render(<MateriasScreen />);

    const alEnfocar = focusEffectMock.mock.calls[0]?.[0] as () => void;

    await act(async () => {
      alEnfocar();
    });
    expect(refetch).not.toHaveBeenCalled();

    await act(async () => {
      alEnfocar();
    });
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('vuelve a consultar al hacer pull-to-refresh', async () => {
    const refetch = configurarConsulta({ data: [MATEMATICA] });

    await render(<MateriasScreen />);

    const lista = screen.getByTestId('materias-lista');

    await act(async () => {
      await lista.props.refreshControl.props.onRefresh();
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
