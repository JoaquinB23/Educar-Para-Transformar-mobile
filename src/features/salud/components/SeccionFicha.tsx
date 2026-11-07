import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../core/config/theme';

import type { FichaMedica } from '../types';

interface SeccionFichaProps {
  ficha: FichaMedica;
}

function valorOInformado(value: string | null | undefined): string {
  return value?.trim() || 'No informado';
}

function mostrarLista(valores: string[]): string {
  return valores.length > 0 ? valores.join(', ') : 'No informado';
}

function mostrarContacto(ficha: FichaMedica): string {
  const contacto = ficha.contactoEmergencia;
  if (typeof contacto === 'string') {
    return valorOInformado(contacto);
  }

  if (!contacto) {
    return 'No informado';
  }

  const datos = [contacto.nombre, contacto.telefono].filter(
    (dato): dato is string => typeof dato === 'string' && dato.trim().length > 0,
  );
  return datos.length > 0 ? datos.join('\n') : 'No informado';
}

function DatoFicha({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

export function SeccionFicha({ ficha }: SeccionFichaProps) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.titulo}>Ficha</Text>
      <DatoFicha etiqueta="Grupo sanguíneo" valor={valorOInformado(ficha.grupoSanguineo)} />
      <DatoFicha etiqueta="Alergias" valor={mostrarLista(ficha.alergias)} />
      <DatoFicha etiqueta="Condiciones" valor={mostrarLista(ficha.condiciones)} />
      <DatoFicha etiqueta="Medicación" valor={valorOInformado(ficha.medicacion)} />
      <DatoFicha etiqueta="Contacto de emergencia" valor={mostrarContacto(ficha)} />
      <DatoFicha etiqueta="Observaciones" valor={valorOInformado(ficha.observaciones)} />
      <DatoFicha
        etiqueta="Actualización"
        valor={`Actualizada el ${valorOInformado(ficha.actualizadoEn)}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: {
    backgroundColor: theme.colores.superficie,
    borderRadius: 10,
    gap: theme.espaciado.md,
    padding: theme.espaciado.md,
  },
  titulo: {
    color: theme.colores.primario,
    fontSize: 20,
    fontWeight: '700',
  },
  dato: {
    gap: theme.espaciado.xs,
  },
  etiqueta: {
    color: theme.colores.texto,
    fontSize: 15,
    fontWeight: '600',
  },
  valor: {
    color: theme.colores.texto,
    fontSize: 16,
  },
});
