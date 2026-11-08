import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { theme } from '../config/theme';

export function PantallaCarga() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>Educar para Transformar</Text>
        <ActivityIndicator size="large" color={theme.colores.primario} />
        <Text style={styles.mensaje}>Cargando…</Text>
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
    gap: theme.espaciado.md,
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
    fontSize: 15,
  },
});
