import { useCallback, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { EstadoCarga } from '../../../core/components/EstadoCarga';
import { EstadoError } from '../../../core/components/EstadoError';
import { EstadoVacio } from '../../../core/components/EstadoVacio';
import { useSession } from '../../../core/auth/session';
import { ROLES } from '../../../core/auth/types';
import { theme } from '../../../core/config/theme';

import { DetalleAcademico } from '../components/DetalleAcademico';
import { useDatosAcademicos } from '../hooks/useDatosAcademicos';

export function MiInformacionScreen() {
  const { perfil } = useSession();
  const academico = useDatosAcademicos();
  const refetchAcademico = academico.refetch;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAcademico();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAcademico]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.titulo}>Mi información</Text>
        {!perfil?.alumnoId || perfil.rol !== ROLES.ALUMNO ? (
          <EstadoVacio mensaje="Tu cuenta no está vinculada a un alumno. Consultá con la institución." />
        ) : academico.isError ? (
          <EstadoError error={academico.error} onReintentar={() => void academico.refetch()} />
        ) : academico.isLoading || !academico.data ? (
          <EstadoCarga />
        ) : (
          <DetalleAcademico datos={academico.data} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colores.fondo,
    flex: 1,
  },
  contenido: {
    gap: theme.espaciado.md,
    padding: theme.espaciado.md,
  },
  titulo: {
    color: theme.colores.primario,
    fontSize: 26,
    fontWeight: '700',
  },
});
