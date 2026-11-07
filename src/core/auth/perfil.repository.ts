import { api } from '../api/client';
import { env } from '../config/env';

import { rolDesdeBackend, ROLES, type Perfil, type Rol } from './types';

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
    hijoIds: [],
  };

  if (rol === ROLES.PADRE) {
    perfil.hijoIds = ['mock-hijo-1', 'mock-hijo-2'];
  } else if (rol === ROLES.ALUMNO) {
    perfil.alumnoId = 'mock-alumno-1';
  }

  return perfil;
}

interface PerfilBackend {
  uid: string;
  email: string;
  dni: string;
  rol: string;
  nivel: string | null;
  nombre: string;
  apellido: string;
  hijoPrimariaId?: string | null;
  hijoSecundariaId?: string | null;
  alumnoId?: string | null;
  cicloLectivoActual: number;
}

export async function obtenerPerfil(): Promise<Perfil> {
  if (__DEV__ && env.mockRol) {
    if (!esRol(env.mockRol)) {
      throw new Error('EXPO_PUBLIC_MOCK_ROL debe ser padre, alumno o profesor.');
    }

    return crearPerfilDePrueba(env.mockRol);
  }

  const response = await api.get<PerfilBackend>('/auth/me');
  const backendPerfil = response.data;

  return {
    id: backendPerfil.uid,
    nombre: `${backendPerfil.nombre} ${backendPerfil.apellido}`.trim(),
    email: backendPerfil.email,
    rol: rolDesdeBackend(backendPerfil.rol),
    alumnoId: backendPerfil.alumnoId || undefined,
    hijoIds: [backendPerfil.hijoPrimariaId, backendPerfil.hijoSecundariaId].filter(
      (id): id is string => typeof id === 'string' && id.length > 0,
    ),
  };
}
