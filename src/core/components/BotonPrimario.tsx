import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../config/theme';

interface BotonPrimarioProps {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  variante?: 'primario' | 'secundario';
}

export function BotonPrimario({
  titulo,
  onPress,
  cargando = false,
  deshabilitado = false,
  variante = 'primario',
}: BotonPrimarioProps) {
  const inactivo = cargando || deshabilitado;
  const esSecundario = variante === 'secundario';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.boton,
        esSecundario ? styles.secundario : styles.primario,
        (pressed || inactivo) && styles.atenuado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={esSecundario ? theme.colores.primario : theme.colores.blanco} />
      ) : (
        <Text style={[styles.texto, esSecundario && styles.textoSecundario]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: theme.espaciado.md,
  },
  primario: {
    backgroundColor: theme.colores.primario,
  },
  secundario: {
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderWidth: 1,
  },
  atenuado: {
    opacity: 0.65,
  },
  texto: {
    color: theme.colores.blanco,
    fontSize: 16,
    fontWeight: '600',
  },
  textoSecundario: {
    color: theme.colores.primario,
  },
});
