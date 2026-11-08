import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { RUTAS, tabsDeRol } from '../../core/auth/rutas';
import { useSession } from '../../core/auth/session';
import { ROLES } from '../../core/auth/types';
import { theme } from '../../core/config/theme';
import { RegistroPushToken } from '../../features/notificaciones/components/RegistroPushToken';

export default function AppLayout() {
  const { status, perfil } = useSession();

  if (status !== 'autenticado' || !perfil) {
    return <Redirect href={RUTAS.login} />;
  }

  const visibles = new Set(tabsDeRol(perfil.rol).map((tab) => tab.name));
  const registrarPush = perfil.rol !== ROLES.PROFESOR;

  return (
    <View style={styles.contenedor}>
      {registrarPush ? <RegistroPushToken /> : null}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colores.primario,
          tabBarInactiveTintColor: theme.colores.texto,
          tabBarLabelStyle: styles.etiquetaTab,
          tabBarStyle: styles.barra,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
        <Tabs.Screen
          name="hijos"
          options={{ title: 'Hijos', href: visibles.has('hijos') ? undefined : null }}
        />
        <Tabs.Screen
          name="mi-informacion"
          options={{
            title: 'Mi información',
            href: visibles.has('mi-informacion') ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="notificaciones"
          options={{
            title: 'Notificaciones',
            href: visibles.has('notificaciones') ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="materias"
          options={{ title: 'Materias', href: visibles.has('materias') ? undefined : null }}
        />
        <Tabs.Screen
          name="asistencia"
          options={{ title: 'Asistencia', href: visibles.has('asistencia') ? undefined : null }}
        />
        <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  barra: {
    height: 58,
    paddingBottom: 8,
    paddingTop: 6,
  },
  etiquetaTab: {
    fontSize: 12,
    fontWeight: '600',
  },
});
