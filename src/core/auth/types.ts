import { ApiError } from '../api/errors';

export const ROLES = {
  PADRE: 'padre',
  ALUMNO: 'alumno',
  PROFESOR: 'profesor',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

export function rolDesdeBackend(rol: string): Rol {
  switch (rol) {
    case 'familia':
      return ROLES.PADRE;
    case 'alumno':
      return ROLES.ALUMNO;
    case 'docente':
      return ROLES.PROFESOR;
    default:
      throw new ApiError(403, 'Tu usuario no tiene acceso a la app móvil', 'unsupported-role');
  }
}

export interface Perfil {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  alumnoId?: string;
  hijoIds: string[];
}
