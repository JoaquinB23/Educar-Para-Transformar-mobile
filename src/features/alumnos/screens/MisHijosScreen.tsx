import { useCallback, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EstadoCarga } from '../../../core/components/EstadoCarga';
import { EstadoError } from '../../../core/components/EstadoError';
import { EstadoVacio } from '../../../core/components/EstadoVacio';
import { theme } from '../../../core/config/theme';

import { DetalleAcademico } from '../components/DetalleAcademico';
import { TarjetaHijo } from '../components/TarjetaHijo';
import { useDatosAcademicos } from '../hooks/useDatosAcademicos';
import { useHijos } from '../hooks/useHijos';

export function MisHijosScreen() {
  const { hijoIds, hijos, isLoading: cargandoHijos, error, refetch } = useHijos();
  const [hijoSeleccionadoId, setHijoSeleccionadoId] = useState<string>();
  const alumnoId =
    hijoIds.length === 1
      ? hijoIds[0]
      : hijoSeleccionadoId && hijoIds.includes(hijoSeleccionadoId)
        ? hijoSeleccionadoId
        : undefined;
  const academico = useDatosAcademicos(alumnoId);
  const refetchAcademico = academico.refetch;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), alumnoId ? refetchAcademico() : Promise.resolve()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, alumnoId, refetchAcademico]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.titulo}>Mis hijos</Text>
        {hijoIds.length === 0 ? (
          <EstadoVacio mensaje="No tenés hijos asociados. Consultá con la institución." />
        ) : (
          <>
            <View>
              <Text style={styles.subtitulo}>Seleccioná un hijo</Text>
              {cargandoHijos ? (
                <Text style={styles.cargando}>Cargando...</Text>
              ) : error ? (
                <EstadoError error={error} onReintentar={() => void refetch()} />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {hijos.map((hijo) => (
                    <TarjetaHijo
                      key={hijo.id}
                      hijo={hijo}
                      seleccionado={alumnoId === hijo.id}
                      onSeleccionar={setHijoSeleccionadoId}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {error ? null : !alumnoId ? (
              !cargandoHijos && (
                <EstadoVacio mensaje="Seleccioná un hijo para consultar sus datos académicos." />
              )
            ) : academico.isError ? (
              <EstadoError error={academico.error} onReintentar={() => void academico.refetch()} />
            ) : academico.isLoading || !academico.data ? (
              <EstadoCarga />
            ) : (
              <DetalleAcademico datos={academico.data} />
            )}
          </>
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
  subtitulo: {
    color: theme.colores.texto,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.espaciado.sm,
  },
  cargando: {
    color: theme.colores.texto,
    fontSize: 16,
    minHeight: 48,
    paddingVertical: theme.espaciado.sm,
  },
});
