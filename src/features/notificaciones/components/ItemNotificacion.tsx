import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../core/config/theme';

import type { Notificacion } from '../types';

interface ItemNotificacionProps {
  notificacion: Notificacion;
  onPress: (notificacion: Notificacion) => void;
}

function etiquetaTipo(tipo: string): string {
  if (tipo === 'atencion') {
    return 'Atención';
  }

  if (tipo === 'ausencia') {
    return 'Ausencia';
  }

  return tipo;
}

function fechaLegible(fecha: string): string {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ItemNotificacion({ notificacion, onPress }: ItemNotificacionProps) {
  const estado = notificacion.leida ? 'leída' : 'no leída';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notificacion.titulo}, ${estado}`}
      onPress={() => onPress(notificacion)}
      style={[styles.item, !notificacion.leida && styles.noLeida]}
    >
      <View style={styles.encabezado}>
        {!notificacion.leida && <View accessibilityLabel="No leída" style={styles.punto} />}
        <Text style={[styles.titulo, !notificacion.leida && styles.tituloNoLeido]}>
          {notificacion.titulo}
        </Text>
      </View>
      <Text style={styles.tipo}>{etiquetaTipo(notificacion.tipo)}</Text>
      <Text style={styles.mensaje}>{notificacion.mensaje}</Text>
      <Text style={styles.fecha}>{fechaLegible(notificacion.creadaEn)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: theme.colores.superficie,
    borderRadius: 10,
    gap: theme.espaciado.sm,
    justifyContent: 'center',
    marginBottom: theme.espaciado.sm,
    minHeight: 48,
    padding: theme.espaciado.md,
  },
  noLeida: {
    borderLeftColor: theme.colores.secundario,
    borderLeftWidth: 4,
  },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.espaciado.sm,
  },
  punto: {
    backgroundColor: theme.colores.secundario,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  titulo: {
    color: theme.colores.texto,
    flex: 1,
    fontSize: 17,
  },
  tituloNoLeido: {
    fontWeight: '700',
  },
  tipo: {
    alignSelf: 'flex-start',
    color: theme.colores.primario,
    fontSize: 13,
    fontWeight: '600',
  },
  mensaje: {
    color: theme.colores.texto,
    fontSize: 15,
  },
  fecha: {
    color: theme.colores.texto,
    fontSize: 13,
  },
});
