import { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EstadoCarga } from '../../../core/components/EstadoCarga';
import { EstadoError } from '../../../core/components/EstadoError';
import { EstadoVacio } from '../../../core/components/EstadoVacio';
import { useSession } from '../../../core/auth/session';
import { theme } from '../../../core/config/theme';
import { ItemAtencion } from '../../salud/components/ItemAtencion';
import { useFichaMedica } from '../../salud/hooks/useFichaMedica';

import { ItemNotificacion } from '../components/ItemNotificacion';
import { useMarcarLeida } from '../hooks/useMarcarLeida';
import { useNotificaciones } from '../hooks/useNotificaciones';
import type { Notificacion } from '../types';

function fechaLegible(fecha: string | undefined): string {
  if (!fecha) {
    return 'Fecha no disponible';
  }

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificacionesScreen() {
  const { perfil } = useSession();
  const consulta = useNotificaciones();
  const refetchNotificaciones = consulta.refetch;
  const marcarLeida = useMarcarLeida();
  const [notificacionDetalle, setNotificacionDetalle] = useState<Notificacion | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const alumnoIdDetalle =
    notificacionDetalle?.tipo === 'atencion' &&
    notificacionDetalle.alumnoId &&
    perfil?.hijoIds.includes(notificacionDetalle.alumnoId)
      ? notificacionDetalle.alumnoId
      : undefined;
  const fichaConsulta = useFichaMedica(alumnoIdDetalle);
  const atencionDetalle = fichaConsulta.data?.ficha?.atenciones.find(
    (atencion) => atencion.id === notificacionDetalle?.atencionId,
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchNotificaciones();
    } finally {
      setRefreshing(false);
    }
  }, [refetchNotificaciones]);

  const onSeleccionarNotificacion = useCallback(
    (notificacion: Notificacion) => {
      marcarLeida.mutate(notificacion);

      if (
        notificacion.tipo === 'atencion' &&
        notificacion.alumnoId &&
        perfil?.hijoIds.includes(notificacion.alumnoId)
      ) {
        setNotificacionDetalle(notificacion);
      }
    },
    [marcarLeida, perfil?.hijoIds],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>Notificaciones</Text>
        {consulta.isLoading && !consulta.data ? (
          <EstadoCarga />
        ) : consulta.isError && !consulta.data ? (
          <EstadoError error={consulta.error} onReintentar={() => void consulta.refetch()} />
        ) : (
          <>
            {marcarLeida.isError && marcarLeida.variables && (
              <EstadoError
                error={marcarLeida.error}
                onReintentar={() => {
                  const notificacion = marcarLeida.variables;
                  if (notificacion) {
                    marcarLeida.mutate(notificacion);
                  }
                }}
              />
            )}
            {consulta.isError && consulta.data && (
              <EstadoError error={consulta.error} onReintentar={() => void consulta.refetch()} />
            )}
            <FlatList
              data={consulta.data?.notificaciones ?? []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ItemNotificacion notificacion={item} onPress={onSeleccionarNotificacion} />
              )}
              ListEmptyComponent={<EstadoVacio mensaje="No tenés notificaciones." />}
              contentContainerStyle={styles.lista}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
              }
            />
          </>
        )}
      </View>

      <Modal
        animationType="slide"
        onRequestClose={() => setNotificacionDetalle(null)}
        transparent
        visible={notificacionDetalle !== null}
      >
        <View style={styles.fondoModal}>
          <View style={styles.modal}>
            <Text style={styles.tituloModal}>{notificacionDetalle?.titulo}</Text>
            <Text style={styles.fechaModal}>
              {fechaLegible(notificacionDetalle?.fecha ?? notificacionDetalle?.creadaEn)}
            </Text>
            {fichaConsulta.isLoading ? (
              <EstadoCarga />
            ) : fichaConsulta.isError ? (
              <EstadoError
                error={fichaConsulta.error}
                onReintentar={() => void fichaConsulta.refetch()}
              />
            ) : atencionDetalle ? (
              <ItemAtencion
                key={atencionDetalle.id}
                atencion={atencionDetalle}
                expandidaInicial
              />
            ) : (
              <EstadoVacio mensaje="No se encontró el detalle de la atención." />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar detalle de atención"
              onPress={() => setNotificacionDetalle(null)}
              style={styles.botonCerrar}
            >
              <Text style={styles.textoBoton}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  lista: {
    flexGrow: 1,
    paddingBottom: theme.espaciado.md,
  },
  fondoModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: theme.espaciado.md,
  },
  modal: {
    backgroundColor: theme.colores.fondo,
    borderRadius: 12,
    gap: theme.espaciado.md,
    maxHeight: '85%',
    padding: theme.espaciado.md,
  },
  tituloModal: {
    color: theme.colores.primario,
    fontSize: 21,
    fontWeight: '700',
  },
  fechaModal: {
    color: theme.colores.texto,
    fontSize: 15,
  },
  botonCerrar: {
    alignItems: 'center',
    backgroundColor: theme.colores.primario,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  textoBoton: {
    color: theme.colores.blanco,
    fontSize: 16,
    fontWeight: '600',
  },
});
