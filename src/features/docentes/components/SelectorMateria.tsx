import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { theme } from '../../../core/config/theme';

import type { MateriaAsignada } from '../types';

interface SelectorMateriaProps {
  materias: MateriaAsignada[];
  seleccionadaId?: string;
  onSeleccionar: (id: string) => void;
}

export function SelectorMateria({
  materias,
  seleccionadaId,
  onSeleccionar,
}: SelectorMateriaProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.lista}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {materias.map((materia) => {
        const seleccionada = materia.id === seleccionadaId;

        return (
          <Pressable
            key={materia.id}
            accessibilityLabel={`Seleccionar ${materia.nombre}`}
            accessibilityRole="button"
            accessibilityState={{ selected: seleccionada }}
            onPress={() => onSeleccionar(materia.id)}
            style={[styles.chip, seleccionada && styles.seleccionada]}
          >
            <Text style={[styles.texto, seleccionada && styles.textoSeleccionado]}>
              {materia.nombre}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: theme.espaciado.sm,
    paddingVertical: 2,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.espaciado.md,
  },
  seleccionada: {
    backgroundColor: theme.colores.primario,
    borderColor: theme.colores.primario,
  },
  texto: {
    color: theme.colores.texto,
    fontSize: 15,
    fontWeight: '600',
  },
  textoSeleccionado: {
    color: theme.colores.blanco,
  },
});
