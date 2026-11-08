import { useSession } from '../../../core/auth/session';
import { RUTAS } from '../../../core/auth/rutas';

import { HomeScreen, type AccesoHome } from '../components/HomeScreen';

const ACCESOS: AccesoHome[] = [
  {
    titulo: 'Mi información',
    descripcion: 'Tus materias, calificaciones y datos académicos.',
    ruta: RUTAS.miInformacion,
  },
  {
    titulo: 'Notificaciones',
    descripcion: 'Novedades y avisos de la institución.',
    ruta: RUTAS.notificaciones,
  },
  {
    titulo: 'Perfil',
    descripcion: 'Tus datos de cuenta y cierre de sesión.',
    ruta: RUTAS.perfil,
  },
];

export function HomeAlumnoScreen() {
  const { perfil } = useSession();

  return (
    <HomeScreen
      accesos={ACCESOS}
      saludo={`Hola${perfil?.nombre ? `, ${perfil.nombre}` : ''}`}
      subtitulo="Panel de alumno"
    />
  );
}
