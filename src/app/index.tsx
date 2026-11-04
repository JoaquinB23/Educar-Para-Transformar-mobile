import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { isConfigComplete, missingEnvKeys } from "@/core/config/env";
import { usePushToken } from "@/features/notificaciones/hooks/usePushToken";

export default function SetupScreen() {
  const { token, error, loading, requestToken } = usePushToken();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Fase A · Development build</Text>
        <Text style={styles.title}>Educar para Transformar</Text>

        {isConfigComplete ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Token FCM del dispositivo</Text>
            <Text selectable style={styles.token}>
              {loading ? "Obteniendo token…" : (token ?? "No disponible")}
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver a obtener el token de notificaciones"
              disabled={loading}
              onPress={() => void requestToken()}
              style={({ pressed }) => [styles.button, (pressed || loading) && styles.buttonPressed]}
            >
              <Text style={styles.buttonText}>Volver a obtener token</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Falta configurar el archivo .env</Text>
            <Text style={styles.paragraph}>
              Completá estas claves en la raíz del proyecto y reiniciá Expo con la caché limpia:
            </Text>
            {missingEnvKeys.map((key) => (
              <Text key={key} style={styles.missingKey}>
                · {key}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7F9",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  eyebrow: {
    color: "#0B4F6C",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    color: "#102A33",
    fontSize: 30,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    color: "#102A33",
    fontSize: 18,
    fontWeight: "600",
  },
  paragraph: {
    color: "#3E5A63",
    fontSize: 15,
    lineHeight: 22,
  },
  token: {
    color: "#102A33",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
  missingKey: {
    color: "#9A3412",
    fontFamily: "monospace",
    fontSize: 13,
  },
  error: {
    color: "#B91C1C",
    fontSize: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#0B4F6C",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 4,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
