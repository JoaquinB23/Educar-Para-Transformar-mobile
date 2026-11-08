import { useSession } from '../../../core/auth/session';
import { RUTAS } from '../../../core/auth/rutas';

import { HomeScreen, type AccesoHome } from '../components/HomeScreen';

const ACCESOS: AccesoHome[] = [
  {
    titulo: 'Mis hijos',
    descripcion: 'Datos académicos, materias y horarios.',
    ruta: RUTAS.hijos,
  },
  {
    titulo: 'Notificaciones',
    descripcion: 'Ausencias, tardanzas y avisos de enfermería.',
    ruta: RUTAS.notificaciones,
  },
  {
    titulo: 'Perfil',
    descripcion: 'Tus datos de cuenta y cierre de sesión.',
    ruta: RUTAS.perfil,
  },
];

export function HomePadreScreen() {
  const { perfil } = useSession();

  return (
    <HomeScreen
      accesos={ACCESOS}
      saludo={`Hola${perfil?.nombre ? `, ${perfil.nombre}` : ''}`}
      subtitulo="Panel de familia"
    />
  );
}
