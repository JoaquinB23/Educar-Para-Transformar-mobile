import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../config/theme';

interface EstadoVacioProps {
  mensaje: string;
}

export function EstadoVacio({ mensaje }: EstadoVacioProps) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.mensaje}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.espaciado.lg,
  },
  mensaje: {
    color: theme.colores.texto,
    fontSize: 16,
    textAlign: 'center',
  },
});
