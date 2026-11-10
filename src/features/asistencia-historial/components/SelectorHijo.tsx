import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { theme } from '../../../core/config/theme';
import { nombreCompleto } from '../../../core/utils/nombre';
import { capitalizar } from '../../../core/utils/texto';

import type { HijoVinculado } from '../types';

interface SelectorHijoProps {
  hijos: HijoVinculado[];
  seleccionadoId?: string;
  onSeleccionar: (id: string) => void;
}

function etiquetaHijo(hijo: HijoVinculado): string {
  const nombre = nombreCompleto(hijo.nombre, hijo.apellido);
  const nivel = hijo.nivel ? capitalizar(hijo.nivel) : null;

  return nivel ? `${nombre} (${nivel})` : nombre;
}

export function SelectorHijo({ hijos, seleccionadoId, onSeleccionar }: SelectorHijoProps) {
  return (
    <ScrollView
      accessibilityLabel="Seleccionar hijo"
      contentContainerStyle={styles.lista}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {hijos.map((hijo) => {
        const seleccionado = hijo.id === seleccionadoId;
        const etiqueta = etiquetaHijo(hijo);

        return (
          <Pressable
            key={hijo.id}
            accessibilityLabel={`Seleccionar ${etiqueta}`}
            accessibilityRole="button"
            accessibilityState={{ selected: seleccionado }}
            onPress={() => onSeleccionar(hijo.id)}
            style={[styles.chip, seleccionado && styles.seleccionado]}
          >
            <Text style={[styles.texto, seleccionado && styles.textoSeleccionado]}>
              {etiqueta}
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
  seleccionado: {
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
