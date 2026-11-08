import { RequiereRol } from '../../core/auth/RequiereRol';
import { ROLES } from '../../core/auth/types';
import { PantallaPendiente } from '../../core/components/PantallaPendiente';

export default function MateriasRoute() {
  return (
    <RequiereRol rol={ROLES.PROFESOR}>
      <PantallaPendiente titulo="Materias" />
    </RequiereRol>
  );
}
