import { RequiereRol } from '../../core/auth/RequiereRol';
import { ROLES } from '../../core/auth/types';
import { MateriasScreen } from '../../features/docentes/screens/MateriasScreen';

export default function MateriasRoute() {
  return (
    <RequiereRol rol={ROLES.PROFESOR}>
      <MateriasScreen />
    </RequiereRol>
  );
}
