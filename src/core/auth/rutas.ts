import { ROLES, type Rol } from './types';

export const RUTAS = {
  login: '/login',
  inicio: '/',
  hijos: '/hijos',
  miInformacion: '/mi-informacion',
  notificaciones: '/notificaciones',
  materias: '/materias',
  asistencia: '/asistencia',
  perfil: '/perfil',
} as const;

export type RutaApp = (typeof RUTAS)[keyof typeof RUTAS];

export interface TabRol {
  name: string;
  title: string;
  roles: Rol[];
}

// El orden define el orden de las pestañas en la barra inferior.
export const TABS_POR_ROL: TabRol[] = [
  { name: 'index', title: 'Inicio', roles: [ROLES.PADRE, ROLES.ALUMNO, ROLES.PROFESOR] },
  { name: 'hijos', title: 'Hijos', roles: [ROLES.PADRE] },
  { name: 'mi-informacion', title: 'Mi información', roles: [ROLES.ALUMNO] },
  { name: 'notificaciones', title: 'Notificaciones', roles: [ROLES.PADRE, ROLES.ALUMNO] },
  { name: 'materias', title: 'Materias', roles: [ROLES.PROFESOR] },
  { name: 'asistencia', title: 'Asistencia', roles: [ROLES.PROFESOR] },
  { name: 'perfil', title: 'Perfil', roles: [ROLES.PADRE, ROLES.ALUMNO, ROLES.PROFESOR] },
];

export function tabsDeRol(rol: Rol): TabRol[] {
  return TABS_POR_ROL.filter((tab) => tab.roles.includes(rol));
}
