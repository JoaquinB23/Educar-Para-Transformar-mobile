import type { HijoVinculado } from '../types';

/**
 * Defensa en cliente: aunque el backend hoy no valide pertenencia, la pantalla
 * solo consulta ids que el perfil declara como propios.
 */
export function filtrarHijosVinculados(
  hijos: HijoVinculado[],
  permitidos: readonly string[],
): HijoVinculado[] {
  const idsPermitidos = new Set(permitidos);

  return hijos.filter((hijo) => idsPermitidos.has(hijo.id));
}
