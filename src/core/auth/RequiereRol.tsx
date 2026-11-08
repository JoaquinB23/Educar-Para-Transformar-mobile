import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';

import { RUTAS } from './rutas';
import { useSession } from './session';
import type { Rol } from './types';

interface RequiereRolProps {
  rol: Rol | Rol[];
  children: ReactNode;
}

// Cubre los deep links: aunque la pestaña esté oculta para el rol, la ruta
// existe y no debe renderizarse para quien no corresponde.
export function RequiereRol({ rol, children }: RequiereRolProps) {
  const { status, perfil } = useSession();
  const roles = Array.isArray(rol) ? rol : [rol];

  if (status !== 'autenticado' || !perfil) {
    return <Redirect href={RUTAS.login} />;
  }

  if (!roles.includes(perfil.rol)) {
    return <Redirect href={RUTAS.inicio} />;
  }

  return <>{children}</>;
}
