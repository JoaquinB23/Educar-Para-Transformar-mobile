import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { theme } from '../config/theme';

export function EstadoCarga() {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator
        size="large"
        color={theme.colores.primario}
        accessibilityLabel="Cargando"
        accessibilityRole="progressbar"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    padding: theme.espaciado.lg,
  },
});
