import { RequiereRol } from '../../core/auth/RequiereRol';
import { ROLES } from '../../core/auth/types';
import { MisHijosScreen } from '../../features/alumnos/screens/MisHijosScreen';

export default function HijosRoute() {
  return (
    <RequiereRol rol={ROLES.PADRE}>
      <MisHijosScreen />
    </RequiereRol>
  );
}
