import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../core/config/theme';
import { fechaLegible } from '../../../core/utils/fecha';

import type { AsistenciaHistorial, EstadoAsistenciaHistorial } from '../types';

const ETIQUETAS: Record<EstadoAsistenciaHistorial, string> = {
  presente: 'Presente',
  tarde: 'Tarde',
  ausente: 'Ausente',
};

const COLORES: Record<EstadoAsistenciaHistorial, string> = {
  presente: theme.colores.primario,
  tarde: theme.colores.secundario,
  ausente: theme.colores.error,
};

function fechaMostrada(fecha: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return 'Fecha no disponible';
  }

  return fechaLegible(fecha);
}

interface FilaAsistenciaHistorialProps {
  registro: AsistenciaHistorial;
}

export function FilaAsistenciaHistorial({ registro }: FilaAsistenciaHistorialProps) {
  const etiqueta = ETIQUETAS[registro.estado] ?? registro.estado;
  const color = COLORES[registro.estado] ?? theme.colores.borde;

  return (
    <View style={styles.fila}>
      <Text style={styles.fecha}>{fechaMostrada(registro.fecha)}</Text>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.estado}>{etiqueta}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    alignItems: 'center',
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: theme.espaciado.md,
    paddingVertical: theme.espaciado.sm,
  },
  fecha: {
    color: theme.colores.texto,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  badge: {
    borderRadius: 999,
    marginLeft: theme.espaciado.sm,
    paddingHorizontal: theme.espaciado.md,
    paddingVertical: theme.espaciado.xs,
  },
  estado: {
    color: theme.colores.blanco,
    fontSize: 13,
    fontWeight: '700',
  },
});
