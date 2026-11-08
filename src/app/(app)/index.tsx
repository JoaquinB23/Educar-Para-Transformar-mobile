import { useSession } from '../../core/auth/session';
import { ROLES } from '../../core/auth/types';
import { HomeAlumnoScreen } from '../../features/acceso/screens/HomeAlumnoScreen';
import { HomePadreScreen } from '../../features/acceso/screens/HomePadreScreen';
import { HomeProfesorScreen } from '../../features/acceso/screens/HomeProfesorScreen';

export default function InicioRoute() {
  const { perfil } = useSession();

  switch (perfil?.rol) {
    case ROLES.PADRE:
      return <HomePadreScreen />;
    case ROLES.ALUMNO:
      return <HomeAlumnoScreen />;
    case ROLES.PROFESOR:
      return <HomeProfesorScreen />;
    default:
      return null;
  }
}
