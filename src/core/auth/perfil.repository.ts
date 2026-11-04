import { api } from '../api/client';
import { env } from '../config/env';

import { ROLES, type Perfil, type Rol } from './types';

function esRol(value: string): value is Rol {
  return Object.values(ROLES).some((rol) => rol === value);
}

function crearPerfilDePrueba(rol: Rol): Perfil {
  const perfil: Perfil = {
    id: `mock-${rol}`,
    nombre:
      rol === ROLES.PADRE
        ? 'Padre de prueba'
        : rol === ROLES.ALUMNO
          ? 'Alumno de prueba'
          : 'Profesor de prueba',
    email: `${rol}@example.test`,
    rol,
  };

  if (rol === ROLES.PADRE) {
    perfil.hijos = [
      { id: 'mock-hijo-1', nombre: 'Hijo de prueba 1' },
      { id: 'mock-hijo-2', nombre: 'Hijo de prueba 2' },
    ];
  }

  return perfil;
}

export async function obtenerPerfil(): Promise<Perfil> {
  if (__DEV__ && env.mockRol) {
    if (!esRol(env.mockRol)) {
      throw new Error('EXPO_PUBLIC_MOCK_ROL debe ser padre, alumno o profesor.');
    }

    return crearPerfilDePrueba(env.mockRol);
  }

  const response = await api.get<Perfil>('/me');
  return response.data;
}
