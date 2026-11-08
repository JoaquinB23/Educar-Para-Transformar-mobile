import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BotonPrimario } from '../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../core/components/CampoTexto';
import { theme } from '../../../core/config/theme';

import { useLoginForm } from '../hooks/useLoginForm';

export function LoginScreen() {
  const { correo, setCorreo, password, setPassword, enviar, enviando, error } = useLoginForm();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Educar para Transformar</Text>
            <Text style={styles.subtitulo}>Ingresá con tu correo institucional</Text>
          </View>

          <View style={styles.formulario}>
            <CampoTexto
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
              ayuda="Ingresá tu DNI. El correo se arma automáticamente."
              keyboardType="email-address"
              label="Correo"
              onChangeText={setCorreo}
              placeholder="Ej.: 96906351"
              returnKeyType="next"
              textContentType="username"
              value={correo}
            />

            <CampoTexto
              autoCapitalize="none"
              autoComplete="current-password"
              label="Contraseña"
              onChangeText={setPassword}
              onSubmitEditing={() => void enviar()}
              returnKeyType="go"
              secureTextEntry
              textContentType="password"
              value={password}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <BotonPrimario
              cargando={enviando}
              onPress={() => void enviar()}
              titulo="Ingresar"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colores.fondo,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    gap: theme.espaciado.xl,
    justifyContent: 'center',
    padding: theme.espaciado.lg,
  },
  encabezado: {
    gap: theme.espaciado.sm,
  },
  titulo: {
    color: theme.colores.primario,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitulo: {
    color: theme.colores.texto,
    fontSize: 16,
    textAlign: 'center',
  },
  formulario: {
    gap: theme.espaciado.md,
  },
  error: {
    color: theme.colores.error,
    fontSize: 15,
    textAlign: 'center',
  },
});
