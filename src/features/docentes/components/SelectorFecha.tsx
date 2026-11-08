import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../core/config/theme';
import { fechaLegible, hoyISO, sumarDias } from '../../../core/utils/fecha';

interface SelectorFechaProps {
  fecha: string;
  onCambiar: (fecha: string) => void;
}

export function SelectorFecha({ fecha, onCambiar }: SelectorFechaProps) {
  const hoy = hoyISO();
  const esHoy = fecha === hoy;
  const puedeAvanzar = sumarDias(fecha, 1) <= hoy;

  return (
    <View style={styles.contenedor}>
      <View style={styles.controles}>
        <Pressable
          accessibilityLabel="Día anterior"
          accessibilityRole="button"
          onPress={() => onCambiar(sumarDias(fecha, -1))}
          style={styles.boton}
        >
          <Text style={styles.flecha}>‹</Text>
        </Pressable>

        <Text style={styles.fecha}>{fechaLegible(fecha)}</Text>

        <Pressable
          accessibilityLabel="Día siguiente"
          accessibilityRole="button"
          accessibilityState={{ disabled: !puedeAvanzar }}
          disabled={!puedeAvanzar}
          onPress={() => onCambiar(sumarDias(fecha, 1))}
          style={[styles.boton, !puedeAvanzar && styles.deshabilitado]}
        >
          <Text style={styles.flecha}>›</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityLabel="Ir al día de hoy"
        accessibilityRole="button"
        accessibilityState={{ disabled: esHoy }}
        disabled={esHoy}
        onPress={() => onCambiar(hoy)}
        style={[styles.botonHoy, esHoy && styles.deshabilitado]}
      >
        <Text style={styles.textoHoy}>Hoy</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.espaciado.sm,
  },
  controles: {
    alignItems: 'center',
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  boton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  flecha: {
    color: theme.colores.primario,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  fecha: {
    color: theme.colores.texto,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  botonHoy: {
    alignItems: 'center',
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.espaciado.md,
  },
  textoHoy: {
    color: theme.colores.primario,
    fontSize: 15,
    fontWeight: '700',
  },
  deshabilitado: {
    opacity: 0.4,
  },
});
