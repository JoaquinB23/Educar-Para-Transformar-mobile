import { RequiereRol } from '../../core/auth/RequiereRol';
import { ROLES } from '../../core/auth/types';
import NotificacionesScreen from '../../features/notificaciones/screens/NotificacionesScreen';

export default function NotificacionesRoute() {
  return (
    <RequiereRol rol={[ROLES.PADRE, ROLES.ALUMNO]}>
      <NotificacionesScreen />
    </RequiereRol>
  );
}
