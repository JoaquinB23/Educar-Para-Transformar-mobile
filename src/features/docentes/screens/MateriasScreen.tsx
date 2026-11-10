import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { EstadoCarga } from '../../../core/components/EstadoCarga';
import { EstadoError } from '../../../core/components/EstadoError';
import { EstadoVacio } from '../../../core/components/EstadoVacio';
import { theme } from '../../../core/config/theme';

import { TarjetaMateria } from '../components/TarjetaMateria';
import { useAsignaciones } from '../hooks/useAsignaciones';

export function MateriasScreen() {
  const consulta = useAsignaciones();
  const { refetch } = consulta;
  const [refrescando, setRefrescando] = useState(false);
  const primeraAparicion = useRef(true);

  // Al volver a la pestaña se vuelve a consultar la API para reflejar los
  // cambios hechos desde la web. La primera aparición ya la resuelve useQuery.
  useFocusEffect(
    useCallback(() => {
      if (primeraAparicion.current) {
        primeraAparicion.current = false;
        return;
      }

      void refetch();
    }, [refetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefrescando(true);
    try {
      await refetch();
    } finally {
      setRefrescando(false);
    }
  }, [refetch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={refrescando} />
        }
        testID="materias-lista"
      >
        <Text style={styles.titulo}>Materias</Text>

        {consulta.isLoading ? (
          <EstadoCarga />
        ) : consulta.isError ? (
          <EstadoError error={consulta.error} onReintentar={() => void consulta.refetch()} />
        ) : !consulta.data?.length ? (
          <EstadoVacio mensaje="No tenés materias asignadas." />
        ) : (
          <>
            <Text style={styles.subtitulo}>
              Tocá una materia para ver su nivel y el listado de alumnos.
            </Text>
            {consulta.data.map((materia) => (
              <TarjetaMateria key={materia.id} materia={materia} />
            ))}
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
    fontSize: 14,
  },
});
