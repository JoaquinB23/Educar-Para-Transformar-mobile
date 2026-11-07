import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../../../core/config/theme';

import type { Hijo } from '../types';

interface TarjetaHijoProps {
  hijo: Hijo;
  seleccionado: boolean;
  onSeleccionar: (id: string) => void;
}

export function TarjetaHijo({ hijo, seleccionado, onSeleccionar }: TarjetaHijoProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Consultar información de ${hijo.nombre}`}
      accessibilityState={{ selected: seleccionado }}
      onPress={() => onSeleccionar(hijo.id)}
      style={[styles.tarjeta, seleccionado && styles.seleccionada]}
    >
      <Text style={[styles.nombre, seleccionado && styles.nombreSeleccionado]}>{hijo.nombre}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    alignItems: 'center',
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: theme.espaciado.sm,
    minHeight: 48,
    paddingHorizontal: theme.espaciado.md,
  },
  seleccionada: {
    backgroundColor: theme.colores.primario,
    borderColor: theme.colores.primario,
  },
  nombre: {
    color: theme.colores.texto,
    fontSize: 15,
    fontWeight: '600',
  },
  nombreSeleccionado: {
    color: theme.colores.blanco,
  },
});
