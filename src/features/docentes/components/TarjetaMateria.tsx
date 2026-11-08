import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../core/config/theme';
import { nombreCompleto } from '../../../core/utils/nombre';

import type { MateriaAsignada } from '../types';

interface TarjetaMateriaProps {
  materia: MateriaAsignada;
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function TarjetaMateria({ materia }: TarjetaMateriaProps) {
  const [expandida, setExpandida] = useState(false);
  const nivel = materia.nivel ? capitalizar(materia.nivel) : 'No informado';

  return (
    <View style={styles.tarjeta}>
      <Pressable
        accessibilityLabel={`${materia.nombre}, nivel ${nivel}, ${materia.alumnos.length} alumnos. ${
          expandida ? 'Ocultar' : 'Ver'
        } listado`}
        accessibilityRole="button"
        accessibilityState={{ expanded: expandida }}
        onPress={() => setExpandida((valor) => !valor)}
        style={styles.encabezado}
      >
        <View style={styles.textos}>
          <Text style={styles.nombre}>{materia.nombre}</Text>
          <Text style={styles.detalle}>
            {materia.codigo} · Nivel {nivel}
          </Text>
          <Text style={styles.cantidad}>
            {materia.alumnos.length} {materia.alumnos.length === 1 ? 'alumno' : 'alumnos'}
          </Text>
        </View>
        <Text style={styles.chevron}>{expandida ? '▾' : '▸'}</Text>
      </Pressable>

      {expandida ? (
        <View style={styles.alumnos}>
          {materia.alumnos.map((alumno) => (
            <View key={alumno.id} style={styles.filaAlumno}>
              <Text style={styles.nombreAlumno}>
                {nombreCompleto(alumno.nombre, alumno.apellido)}
              </Text>
              {alumno.legajo ? (
                <Text style={styles.legajo}>Legajo {alumno.legajo}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.espaciado.sm,
    minHeight: 48,
    padding: theme.espaciado.md,
  },
  textos: {
    flex: 1,
    gap: theme.espaciado.xs,
  },
  nombre: {
    color: theme.colores.primario,
    fontSize: 17,
    fontWeight: '700',
  },
  detalle: {
    color: theme.colores.texto,
    fontSize: 14,
  },
  cantidad: {
    color: theme.colores.texto,
    fontSize: 13,
    opacity: 0.7,
  },
  chevron: {
    color: theme.colores.primario,
    fontSize: 20,
    fontWeight: '700',
  },
  alumnos: {
    borderTopColor: theme.colores.borde,
    borderTopWidth: 1,
    gap: theme.espaciado.sm,
    padding: theme.espaciado.md,
  },
  filaAlumno: {
    gap: 2,
  },
  nombreAlumno: {
    color: theme.colores.texto,
    fontSize: 15,
  },
  legajo: {
    color: theme.colores.texto,
    fontSize: 12,
    opacity: 0.7,
  },
});
