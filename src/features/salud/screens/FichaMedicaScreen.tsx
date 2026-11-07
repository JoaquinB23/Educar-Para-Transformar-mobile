import { useCallback, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EstadoCarga } from '../../../core/components/EstadoCarga';
import { EstadoError } from '../../../core/components/EstadoError';
import { EstadoVacio } from '../../../core/components/EstadoVacio';
import { theme } from '../../../core/config/theme';
import { TarjetaHijo } from '../../alumnos/components/TarjetaHijo';
import { useHijos } from '../../alumnos/hooks/useHijos';

import { ItemAtencion } from '../components/ItemAtencion';
import { SeccionFicha } from '../components/SeccionFicha';
import { useFichaMedica } from '../hooks/useFichaMedica';

export function FichaMedicaScreen() {
  const { hijoIds, hijos, isLoading: cargandoHijos, error, refetch } = useHijos();
  const [hijoSeleccionadoId, setHijoSeleccionadoId] = useState<string>();
  const alumnoId =
    hijoIds.length === 1
      ? hijoIds[0]
      : hijoSeleccionadoId && hijoIds.includes(hijoSeleccionadoId)
        ? hijoSeleccionadoId
        : undefined;
  const fichaConsulta = useFichaMedica(alumnoId);
  const refetchFicha = fichaConsulta.refetch;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), alumnoId ? refetchFicha() : Promise.resolve()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, alumnoId, refetchFicha]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.titulo}>Ficha médica</Text>
        {hijoIds.length === 0 ? (
          <EstadoVacio mensaje="No tenés hijos asociados. Consultá con la institución." />
        ) : error ? (
          <EstadoError error={error} onReintentar={() => void refetch()} />
        ) : (
          <>
            <View style={styles.selector}>
              <Text style={styles.subtitulo}>Seleccioná un hijo</Text>
              {cargandoHijos ? (
                <EstadoCarga />
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

            {!alumnoId ? (
              !cargandoHijos && (
                <EstadoVacio mensaje="Seleccioná un hijo para consultar su ficha médica." />
              )
            ) : fichaConsulta.isError ? (
              <EstadoError
                error={fichaConsulta.error}
                onReintentar={() => void fichaConsulta.refetch()}
              />
            ) : fichaConsulta.isLoading || !fichaConsulta.data ? (
              <EstadoCarga />
            ) : fichaConsulta.data.ficha === null ? (
              <EstadoVacio
                mensaje={
                  fichaConsulta.data.mensaje ?? 'El alumno todavía no tiene ficha médica cargada'
                }
              />
            ) : (
              <>
                <SeccionFicha ficha={fichaConsulta.data.ficha} />
                <View style={styles.atenciones}>
                  <Text style={styles.subtitulo}>Atenciones de enfermería</Text>
                  {fichaConsulta.data.ficha.atenciones.length === 0 ? (
                    <EstadoVacio mensaje="Sin atenciones registradas." />
                  ) : (
                    fichaConsulta.data.ficha.atenciones.map((atencion) => (
                      <ItemAtencion key={atencion.id} atencion={atencion} />
                    ))
                  )}
                </View>
              </>
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
  selector: {
    gap: theme.espaciado.sm,
  },
  subtitulo: {
    color: theme.colores.texto,
    fontSize: 18,
    fontWeight: '600',
  },
  atenciones: {
    gap: theme.espaciado.sm,
  },
});
