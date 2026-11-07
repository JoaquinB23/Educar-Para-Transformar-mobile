import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../api/errors';
import { theme } from '../config/theme';

interface EstadoErrorProps {
  error: unknown;
  onReintentar: () => void;
}

function obtenerMensaje(error: unknown): string {
  if (error instanceof ApiError && error.status === 0) {
    return 'Sin conexión. Revisá tu red e intentá de nuevo';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Ocurrió un error. Intentá nuevamente.';
}

export function EstadoError({ error, onReintentar }: EstadoErrorProps) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.mensaje}>{obtenerMensaje(error)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reintentar"
        onPress={onReintentar}
        style={styles.boton}
      >
        <Text style={styles.textoBoton}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    gap: theme.espaciado.md,
    padding: theme.espaciado.lg,
  },
  mensaje: {
    color: theme.colores.error,
    fontSize: 16,
    textAlign: 'center',
  },
  boton: {
    alignItems: 'center',
    backgroundColor: theme.colores.primario,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 120,
    paddingHorizontal: theme.espaciado.md,
  },
  textoBoton: {
    color: theme.colores.blanco,
    fontSize: 16,
    fontWeight: '600',
  },
});
