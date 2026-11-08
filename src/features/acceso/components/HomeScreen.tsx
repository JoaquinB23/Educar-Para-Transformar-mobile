import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../core/config/theme';

import { AccesoRapido } from './AccesoRapido';

export interface AccesoHome {
  titulo: string;
  descripcion: string;
  ruta: Href;
  pendiente?: boolean;
}

interface HomeScreenProps {
  saludo: string;
  subtitulo: string;
  accesos: AccesoHome[];
}

export function HomeScreen({ saludo, subtitulo, accesos }: HomeScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>{saludo}</Text>
          <Text style={styles.subtitulo}>{subtitulo}</Text>
        </View>

        <View style={styles.accesos}>
          {accesos.map((acceso) => (
            <AccesoRapido
              key={acceso.titulo}
              descripcion={acceso.descripcion}
              onPress={() => router.push(acceso.ruta)}
              pendiente={acceso.pendiente}
              titulo={acceso.titulo}
            />
          ))}
        </View>
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
  encabezado: {
    gap: theme.espaciado.xs,
  },
  titulo: {
    color: theme.colores.primario,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitulo: {
    color: theme.colores.texto,
    fontSize: 16,
  },
  accesos: {
    gap: theme.espaciado.md,
  },
});
