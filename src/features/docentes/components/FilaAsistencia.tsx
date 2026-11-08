import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../core/config/theme';
import { nombreCompleto } from '../../../core/utils/nombre';

import type { AlumnoAsignado, EstadoAsistencia } from '../types';

const ESTADOS: { valor: EstadoAsistencia; etiqueta: string }[] = [
  { valor: 'presente', etiqueta: 'Presente' },
  { valor: 'tarde', etiqueta: 'Tarde' },
  { valor: 'ausente', etiqueta: 'Ausente' },
];

interface FilaAsistenciaProps {
  alumno: AlumnoAsignado;
  estado: EstadoAsistencia;
  onCambiar: (alumnoId: string, estado: EstadoAsistencia) => void;
}

function colorDeEstado(estado: EstadoAsistencia): string {
  if (estado === 'tarde') {
    return theme.colores.secundario;
  }

  if (estado === 'ausente') {
    return theme.colores.error;
  }

  return theme.colores.primario;
}

export function FilaAsistencia({ alumno, estado, onCambiar }: FilaAsistenciaProps) {
  const nombre = nombreCompleto(alumno.nombre, alumno.apellido);

  return (
    <View style={styles.fila}>
      <View style={styles.datos}>
        <Text style={styles.nombre}>{nombre}</Text>
        {alumno.legajo ? <Text style={styles.legajo}>Legajo {alumno.legajo}</Text> : null}
      </View>

      <View style={styles.estados}>
        {ESTADOS.map((opcion) => {
          const seleccionado = estado === opcion.valor;
          const color = colorDeEstado(opcion.valor);

          return (
            <Pressable
              key={opcion.valor}
              accessibilityLabel={`${nombre}: ${opcion.etiqueta}`}
              accessibilityRole="button"
              accessibilityState={{ selected: seleccionado }}
              onPress={() => onCambiar(alumno.id, opcion.valor)}
              style={[
                styles.opcion,
                seleccionado && { backgroundColor: color, borderColor: color },
              ]}
            >
              <Text style={[styles.textoOpcion, seleccionado && styles.textoSeleccionado]}>
                {opcion.etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 10,
    borderWidth: 1,
    gap: theme.espaciado.sm,
    padding: theme.espaciado.md,
  },
  datos: {
    gap: 2,
  },
  nombre: {
    color: theme.colores.texto,
    fontSize: 15,
    fontWeight: '600',
  },
  legajo: {
    color: theme.colores.texto,
    fontSize: 12,
    opacity: 0.7,
  },
  estados: {
    flexDirection: 'row',
    gap: theme.espaciado.sm,
  },
  opcion: {
    alignItems: 'center',
    backgroundColor: theme.colores.fondo,
    borderColor: theme.colores.borde,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.espaciado.xs,
  },
  textoOpcion: {
    color: theme.colores.texto,
    fontSize: 13,
    fontWeight: '600',
  },
  textoSeleccionado: {
    color: theme.colores.blanco,
  },
});
