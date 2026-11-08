import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EstadoCarga } from '../../../core/components/EstadoCarga';
import { EstadoError } from '../../../core/components/EstadoError';
import { EstadoVacio } from '../../../core/components/EstadoVacio';
import { BotonPrimario } from '../../../core/components/BotonPrimario';
import { theme } from '../../../core/config/theme';
import { hoyISO } from '../../../core/utils/fecha';
import { capitalizar } from '../../../core/utils/texto';

import { FilaAsistencia } from '../components/FilaAsistencia';
import { SelectorFecha } from '../components/SelectorFecha';
import { SelectorMateria } from '../components/SelectorMateria';
import { useAsignaciones } from '../hooks/useAsignaciones';
import { useAsistencia } from '../hooks/useAsistencia';
import type { EstadoAsistencia } from '../types';

const SIN_CAMBIOS: Record<string, EstadoAsistencia> = {};

export function AsistenciaScreen() {
  const asignaciones = useAsignaciones();
  const [materiaId, setMateriaId] = useState<string>();
  const [fecha, setFecha] = useState(hoyISO);
  const [edicion, setEdicion] = useState<{
    clave: string;
    cambios: Record<string, EstadoAsistencia>;
  }>({ clave: '', cambios: {} });

  const materiaSeleccionadaId = materiaId ?? asignaciones.data?.[0]?.id;
  const materia = asignaciones.data?.find((item) => item.id === materiaSeleccionadaId);
  const asistencia = useAsistencia(materiaSeleccionadaId, fecha);
  const claveSeleccion = `${materiaSeleccionadaId ?? ''}|${fecha}`;
  const cambios = edicion.clave === claveSeleccion ? edicion.cambios : SIN_CAMBIOS;

  const estados = useMemo(() => {
    const base: Record<string, EstadoAsistencia> = {};

    for (const alumno of materia?.alumnos ?? []) {
      base[alumno.id] = 'presente';
    }

    for (const registro of asistencia.consulta.data ?? []) {
      base[registro.alumnoId] = registro.estado;
    }

    return { ...base, ...cambios };
  }, [materia, asistencia.consulta.data, cambios]);

  const cambiarEstado = (alumnoId: string, estado: EstadoAsistencia) => {
    setEdicion((actual) => ({
      clave: claveSeleccion,
      cambios: {
        ...(actual.clave === claveSeleccion ? actual.cambios : SIN_CAMBIOS),
        [alumnoId]: estado,
      },
    }));
  };

  const guardar = () => {
    if (!materia || materia.alumnos.length === 0) {
      return;
    }

    asistencia.mutacion.mutate({
      materiaId: materia.id,
      fecha,
      registros: materia.alumnos.map((alumno) => ({
        alumnoId: alumno.id,
        estado: estados[alumno.id] ?? 'presente',
      })),
    });
  };

  const resultado = asistencia.mutacion.data;
  const coincideSeleccion =
    asistencia.mutacion.variables?.materiaId === materiaSeleccionadaId &&
    asistencia.mutacion.variables?.fecha === fecha;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Asistencia</Text>

        {asignaciones.isLoading ? (
          <EstadoCarga />
        ) : asignaciones.isError ? (
          <EstadoError error={asignaciones.error} onReintentar={() => void asignaciones.refetch()} />
        ) : !asignaciones.data?.length ? (
          <EstadoVacio mensaje="No tenés materias asignadas." />
        ) : (
          <>
            <View style={styles.bloque}>
              <Text style={styles.etiqueta}>Materia</Text>
              <SelectorMateria
                materias={asignaciones.data}
                onSeleccionar={setMateriaId}
                seleccionadaId={materiaSeleccionadaId}
              />
            </View>

            <View style={styles.bloque}>
              <Text style={styles.etiqueta}>Fecha</Text>
              <SelectorFecha fecha={fecha} onCambiar={setFecha} />
            </View>

            {materia ? (
              <View style={styles.resumen}>
                <Text style={styles.materiaNombre}>{materia.nombre}</Text>
                <Text style={styles.materiaDetalle}>
                  {materia.codigo} · Nivel{' '}
                  {materia.nivel ? capitalizar(materia.nivel) : 'No informado'}
                </Text>
              </View>
            ) : null}

            {asistencia.consulta.isLoading ? (
              <EstadoCarga />
            ) : asistencia.consulta.isError ? (
              <EstadoError
                error={asistencia.consulta.error}
                onReintentar={() => void asistencia.consulta.refetch()}
              />
            ) : materia && materia.alumnos.length === 0 ? (
              <EstadoVacio mensaje="La materia no tiene alumnos inscriptos." />
            ) : materia ? (
              <View style={styles.alumnos}>
                {materia.alumnos.map((alumno) => (
                  <FilaAsistencia
                    key={alumno.id}
                    alumno={alumno}
                    estado={estados[alumno.id] ?? 'presente'}
                    onCambiar={(alumnoId, estado) => cambiarEstado(alumnoId, estado)}
                  />
                ))}
              </View>
            ) : null}

            {asistencia.mutacion.isError && coincideSeleccion ? (
              <EstadoError
                error={asistencia.mutacion.error}
                onReintentar={guardar}
              />
            ) : null}

            {asistencia.mutacion.isSuccess && coincideSeleccion && resultado ? (
              <View style={styles.resultado}>
                <Text style={styles.exito}>
                  Asistencia guardada: {resultado.registros.length} registro
                  {resultado.registros.length === 1 ? '' : 's'}.
                </Text>
                {resultado.descartados.length > 0 ? (
                  <Text style={styles.aviso}>
                    {resultado.descartados.length} registro
                    {resultado.descartados.length === 1 ? '' : 's'} descartado
                    {resultado.descartados.length === 1 ? '' : 's'} por el servidor.
                  </Text>
                ) : null}
                {resultado.avisos.sinTutor.length > 0 ? (
                  <Text style={styles.aviso}>
                    {resultado.avisos.sinTutor.length} alumno
                    {resultado.avisos.sinTutor.length === 1 ? '' : 's'} sin tutor vinculado:
                    no se pudo enviar el aviso.
                  </Text>
                ) : null}
              </View>
            ) : null}

            <BotonPrimario
              cargando={asistencia.mutacion.isPending}
              deshabilitado={!materia || materia.alumnos.length === 0}
              onPress={guardar}
              titulo="Guardar asistencia"
            />
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
  bloque: {
    gap: theme.espaciado.xs,
  },
  etiqueta: {
    color: theme.colores.texto,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  resumen: {
    gap: 2,
  },
  materiaNombre: {
    color: theme.colores.primario,
    fontSize: 18,
    fontWeight: '700',
  },
  materiaDetalle: {
    color: theme.colores.texto,
    fontSize: 14,
  },
  alumnos: {
    gap: theme.espaciado.sm,
  },
  resultado: {
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 8,
    borderWidth: 1,
    gap: theme.espaciado.xs,
    padding: theme.espaciado.md,
  },
  exito: {
    color: theme.colores.primario,
    fontSize: 15,
    fontWeight: '600',
  },
  aviso: {
    color: theme.colores.secundario,
    fontSize: 14,
  },
});
