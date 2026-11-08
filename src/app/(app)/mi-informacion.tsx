import { RequiereRol } from '../../core/auth/RequiereRol';
import { ROLES } from '../../core/auth/types';
import { MiInformacionScreen } from '../../features/alumnos/screens/MiInformacionScreen';

export default function MiInformacionRoute() {
  return (
    <RequiereRol rol={ROLES.ALUMNO}>
      <MiInformacionScreen />
    </RequiereRol>
  );
}
