export const ROLES = {
  PADRE: 'padre',
  ALUMNO: 'alumno',
  PROFESOR: 'profesor',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

export interface Hijo {
  id: string;
  nombre: string;
}

export interface Perfil {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  hijos?: Hijo[];
}
