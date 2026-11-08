import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../core/config/theme';

interface AccesoRapidoProps {
  titulo: string;
  descripcion: string;
  onPress: () => void;
  pendiente?: boolean;
}

export function AccesoRapido({ titulo, descripcion, onPress, pendiente = false }: AccesoRapidoProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: pendiente }}
      disabled={pendiente}
      onPress={onPress}
      style={({ pressed }) => [styles.tarjeta, (pressed || pendiente) && styles.atenuada]}
    >
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{descripcion}</Text>
      </View>
      {pendiente ? <Text style={styles.etiqueta}>Próximamente</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.espaciado.md,
    justifyContent: 'space-between',
    padding: theme.espaciado.md,
  },
  atenuada: {
    opacity: 0.7,
  },
  textos: {
    flex: 1,
    gap: theme.espaciado.xs,
  },
  titulo: {
    color: theme.colores.primario,
    fontSize: 18,
    fontWeight: '600',
  },
  descripcion: {
    color: theme.colores.texto,
    fontSize: 14,
  },
  etiqueta: {
    alignSelf: 'center',
    color: theme.colores.secundario,
    fontSize: 12,
    fontWeight: '600',
  },
});
