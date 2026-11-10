import { useMemo, useState, type ReactNode } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSession } from '../../../core/auth/session';
import { ROLES } from '../../../core/auth/types';
import { EstadoCarga } from '../../../core/components/EstadoCarga';
import { EstadoError } from '../../../core/components/EstadoError';
import { EstadoVacio } from '../../../core/components/EstadoVacio';
import { theme } from '../../../core/config/theme';

import { FilaAsistenciaHistorial } from '../components/FilaAsistenciaHistorial';
import { SelectorHijo } from '../components/SelectorHijo';
import { useHijos } from '../hooks/useHijos';
import { useHistorialAsistencia } from '../hooks/useHistorialAsistencia';
import { filtrarHijosVinculados } from '../utils/hijos';

export function AsistenciaHistorialScreen() {
  const { perfil } = useSession();
  const esPadre = perfil?.rol === ROLES.PADRE;
  const esAlumno = perfil?.rol === ROLES.ALUMNO;

  // El padre necesita los nombres de sus hijos; el backend los devuelve en
  // `/api/auth/me` a partir de los ids vinculados al propio perfil.
  const hijosConsulta = useHijos(esPadre);
  const [hijoSeleccionadoId, setHijoSeleccionadoId] = useState<string>();

  // Defensa en cliente: solo se ofrecen los hijos que el perfil declara.
  const hijos = useMemo(
    () => filtrarHijosVinculados(hijosConsulta.data ?? [], perfil?.hijoIds ?? []),
    [hijosConsulta.data, perfil?.hijoIds],
  );

  const hijoSeleccionado =
    hijos.find((hijo) => hijo.id === hijoSeleccionadoId) ?? hijos[0];

  let alumnoId: string | undefined;
  if (esAlumno) {
    alumnoId = perfil?.alumnoId;
  } else if (esPadre) {
    alumnoId = hijoSeleccionado?.id;
  }

  const consulta = useHistorialAsistencia(alumnoId);

  let contenido: ReactNode;

  if (!perfil) {
    contenido = <EstadoVacio mensaje="Iniciá sesión para ver la asistencia." />;
  } else if (!esAlumno && !esPadre) {
    contenido = (
      <EstadoVacio mensaje="Esta sección está disponible para alumnos y familias." />
    );
  } else if (esAlumno && !perfil.alumnoId) {
    contenido = (
      <EstadoVacio mensaje="Tu cuenta todavía no está vinculada a un registro de alumno." />
    );
  } else if (esPadre && hijosConsulta.isLoading && !hijosConsulta.data) {
    contenido = <EstadoCarga />;
  } else if (esPadre && hijosConsulta.isError && !hijosConsulta.data) {
    contenido = (
      <EstadoError
        error={hijosConsulta.error}
        onReintentar={() => void hijosConsulta.refetch()}
      />
    );
  } else if (esPadre && hijos.length === 0) {
    contenido = <EstadoVacio mensaje="No tenés hijos vinculados." />;
  } else {
    contenido = (
      <>
        {esPadre ? (
          <>
            <Text style={styles.subtitulo}>Elegí un hijo para ver su asistencia.</Text>
            <SelectorHijo
              hijos={hijos}
              onSeleccionar={setHijoSeleccionadoId}
              seleccionadoId={hijoSeleccionado?.id}
            />
          </>
        ) : null}

        {consulta.isLoading && !consulta.data ? (
          <EstadoCarga />
        ) : consulta.isError && !consulta.data ? (
          <EstadoError
            error={consulta.error}
            onReintentar={() => void consulta.refetch()}
          />
        ) : (
          <>
            {consulta.isError && consulta.data ? (
              <EstadoError
                error={consulta.error}
                onReintentar={() => void consulta.refetch()}
              />
            ) : null}

            <FlatList
              contentContainerStyle={styles.lista}
              data={consulta.data ?? []}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <EstadoVacio mensaje="No hay registros de asistencia para mostrar." />
              }
              refreshControl={
                <RefreshControl
                  onRefresh={() => void consulta.refetch()}
                  refreshing={consulta.isRefetching}
                />
              }
              renderItem={({ item }) => <FilaAsistenciaHistorial registro={item} />}
              style={styles.listaContenedor}
              testID="asistencia-historial-lista"
            />
          </>
        )}
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>Historial de asistencia</Text>
        {contenido}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colores.fondo,
    flex: 1,
  },
  contenido: {
    flex: 1,
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
  lista: {
    flexGrow: 1,
    gap: theme.espaciado.sm,
    paddingBottom: theme.espaciado.md,
  },
  listaContenedor: {
    flex: 1,
  },
});
