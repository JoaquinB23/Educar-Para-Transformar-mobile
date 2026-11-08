import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { theme } from '../config/theme';

interface CampoTextoProps extends TextInputProps {
  label: string;
  error?: string | null;
  ayuda?: string;
}

export function CampoTexto({ label, error, ayuda, style, ...props }: CampoTextoProps) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? ayuda}
        placeholderTextColor={theme.colores.texto}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : ayuda ? (
        <Text style={styles.ayuda}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: theme.espaciado.xs,
  },
  label: {
    color: theme.colores.texto,
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colores.fondo,
    borderColor: theme.colores.borde,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colores.texto,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: theme.espaciado.md,
  },
  inputError: {
    borderColor: theme.colores.error,
  },
  error: {
    color: theme.colores.error,
    fontSize: 14,
  },
  ayuda: {
    color: theme.colores.texto,
    fontSize: 13,
    opacity: 0.8,
  },
});
