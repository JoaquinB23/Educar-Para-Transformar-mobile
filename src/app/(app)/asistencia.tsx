import { RequiereRol } from '../../core/auth/RequiereRol';
import { ROLES } from '../../core/auth/types';
import { AsistenciaScreen } from '../../features/docentes/screens/AsistenciaScreen';

export default function AsistenciaRoute() {
  return (
    <RequiereRol rol={ROLES.PROFESOR}>
      <AsistenciaScreen />
    </RequiereRol>
  );
}
