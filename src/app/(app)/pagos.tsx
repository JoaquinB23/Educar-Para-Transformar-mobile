import { RequiereRol } from '../../core/auth/RequiereRol';
import { ROLES } from '../../core/auth/types';
import { PagosScreen } from '../../features/pagos/screens/PagosScreen';

export default function PagosRoute() {
  return (
    <RequiereRol rol={ROLES.PADRE}>
      <PagosScreen />
    </RequiereRol>
  );
}