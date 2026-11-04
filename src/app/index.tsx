import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { env } from '@/core/config/env';
import { usePushToken } from '@/features/notificaciones/hooks/usePushToken';

export default function Index() {
  const { token, error, loading, requestToken } = usePushToken();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Educar App</Text>
      <Text style={styles.subtitle}>Fase A — verificación de notificaciones push</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Backend</Text>
        <Text style={styles.value}>{env.apiUrl}</Text>
        <Text style={styles.label}>Token FCM</Text>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.value}>Obteniendo token…</Text>
          </View>
        ) : (
          <Text selectable style={styles.value}>
            {token ?? 'Sin token'}
          </Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => {
          void requestToken();
        }}
        style={({ pressed }) => [styles.button, (pressed || loading) && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Volver a solicitar token</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 16,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
  },
  card: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#6b7280',
  },
  value: {
    fontSize: 15,
    color: '#111827',
    flexShrink: 1,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  error: {
    fontSize: 14,
    color: '#b91c1c',
  },
  button: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1d4ed8',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
