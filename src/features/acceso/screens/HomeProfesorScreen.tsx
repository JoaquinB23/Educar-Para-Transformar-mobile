import { useSession } from '../../../core/auth/session';
import { RUTAS } from '../../../core/auth/rutas';

import { HomeScreen, type AccesoHome } from '../components/HomeScreen';

const ACCESOS: AccesoHome[] = [
  {
    titulo: 'Materias',
    descripcion: 'Materias y cursos a cargo.',
    ruta: RUTAS.materias,
  },
  {
    titulo: 'Asistencia',
    descripcion: 'Registro de asistencia por curso.',
    ruta: RUTAS.asistencia,
  },
  {
    titulo: 'Perfil',
    descripcion: 'Tus datos de cuenta y cierre de sesión.',
    ruta: RUTAS.perfil,
  },
];

export function HomeProfesorScreen() {
  const { perfil } = useSession();

  return (
    <HomeScreen
      accesos={ACCESOS}
      saludo={`Hola${perfil?.nombre ? `, ${perfil.nombre}` : ''}`}
      subtitulo="Panel de docente"
    />
  );
}
