import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { dniDesdeEmail } from '../../../core/auth/dni';
import { useSession } from '../../../core/auth/session';
import { ETIQUETA_ROL } from '../../../core/auth/types';
import { BotonPrimario } from '../../../core/components/BotonPrimario';
import { theme } from '../../../core/config/theme';

import { useCerrarSesion } from '../hooks/useCerrarSesion';

export function PerfilScreen() {
  const { perfil } = useSession();
  const { cerrar, enviando, error } = useCerrarSesion();

  if (!perfil) return null;

  const filas: { etiqueta: string; valor: string }[] = [
    { etiqueta: 'Nombre', valor: perfil.nombre },
    { etiqueta: 'DNI', valor: dniDesdeEmail(perfil.email) },
    { etiqueta: 'Rol', valor: ETIQUETA_ROL[perfil.rol] },
  ];

  if (perfil.nivel) {
    filas.push({ etiqueta: 'Nivel', valor: perfil.nivel });
  }

  if (perfil.cicloLectivoActual) {
    filas.push({ etiqueta: 'Ciclo lectivo', valor: String(perfil.cicloLectivoActual) });
  }

  if (perfil.rol === 'padre') {
    filas.push({
      etiqueta: 'Hijos vinculados',
      valor: String(perfil.hijoIds.length),
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Perfil</Text>

        <View style={styles.tarjeta}>
          {filas.map((fila) => (
            <View key={fila.etiqueta} style={styles.fila}>
              <Text style={styles.etiqueta}>{fila.etiqueta}</Text>
              <Text style={styles.valor}>{fila.valor}</Text>
            </View>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <BotonPrimario
          cargando={enviando}
          onPress={() => void cerrar()}
          titulo="Cerrar sesión"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colores.fondo,
    flex: 1,
  },
  contenido: {
    gap: theme.espaciado.lg,
    padding: theme.espaciado.md,
  },
  titulo: {
    color: theme.colores.primario,
    fontSize: 26,
    fontWeight: '700',
  },
  tarjeta: {
    backgroundColor: theme.colores.superficie,
    borderColor: theme.colores.borde,
    borderRadius: 12,
    borderWidth: 1,
    gap: theme.espaciado.md,
    padding: theme.espaciado.md,
  },
  fila: {
    gap: theme.espaciado.xs,
  },
  etiqueta: {
    color: theme.colores.texto,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  valor: {
    color: theme.colores.texto,
    fontSize: 16,
  },
  error: {
    color: theme.colores.error,
    fontSize: 15,
    textAlign: 'center',
  },
});
