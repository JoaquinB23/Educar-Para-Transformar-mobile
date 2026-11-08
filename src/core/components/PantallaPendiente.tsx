import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { theme } from '../config/theme';

interface PantallaPendienteProps {
  titulo: string;
  mensaje?: string;
}

export function PantallaPendiente({
  titulo,
  mensaje = 'Esta sección se habilita en la próxima fase.',
}: PantallaPendienteProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.mensaje}>{mensaje}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colores.fondo,
    flex: 1,
  },
  contenido: {
    alignItems: 'center',
    flex: 1,
    gap: theme.espaciado.sm,
    justifyContent: 'center',
    padding: theme.espaciado.lg,
  },
  titulo: {
    color: theme.colores.primario,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  mensaje: {
    color: theme.colores.texto,
    fontSize: 16,
    textAlign: 'center',
  },
});
