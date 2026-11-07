import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../core/config/theme';

import type { Atencion } from '../types';

interface ItemAtencionProps {
  atencion: Atencion;
}

function valorOInformado(value: string | null | undefined): string {
  return value?.trim() || 'No informado';
}

function Detalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.detalle}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

export function ItemAtencion({ atencion }: ItemAtencionProps) {
  const [expandida, setExpandida] = useState(false);

  return (
    <View style={styles.contenedor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Atención del ${atencion.fecha}: ${atencion.motivo}`}
        accessibilityState={{ expanded: expandida }}
        onPress={() => setExpandida((actual) => !actual)}
        style={styles.boton}
      >
        <Text style={styles.fecha}>{atencion.fecha}</Text>
        <Text style={styles.motivo}>{atencion.motivo}</Text>
      </Pressable>
      {expandida && (
        <View style={styles.contenido}>
          <Detalle
            etiqueta="Diagnóstico"
            valor={valorOInformado(atencion.diagnostico)}
          />
          <Detalle
            etiqueta="Tratamiento"
            valor={valorOInformado(atencion.tratamiento)}
          />
          <Detalle
            etiqueta="Observaciones"
            valor={valorOInformado(atencion.observaciones)}
          />
          <Text style={styles.registradoPor}>
            Registrada por {valorOInformado(atencion.registradoPor)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: theme.colores.superficie,
    borderRadius: 8,
    overflow: 'hidden',
  },
  boton: {
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: theme.espaciado.md,
    paddingVertical: theme.espaciado.sm,
  },
  fecha: {
    color: theme.colores.secundario,
    fontSize: 14,
    fontWeight: '600',
  },
  motivo: {
    color: theme.colores.texto,
    fontSize: 16,
    fontWeight: '600',
  },
  contenido: {
    borderTopColor: theme.colores.borde,
    borderTopWidth: 1,
    gap: theme.espaciado.md,
    padding: theme.espaciado.md,
  },
  detalle: {
    gap: theme.espaciado.xs,
  },
  etiqueta: {
    color: theme.colores.texto,
    fontSize: 14,
    fontWeight: '600',
  },
  valor: {
    color: theme.colores.texto,
    fontSize: 15,
  },
  registradoPor: {
    color: theme.colores.texto,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
