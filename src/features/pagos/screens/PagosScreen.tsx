import { useState } from 'react';
import { Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSession } from '../../../core/auth/session';
import { EstadoCarga } from '../../../core/components/EstadoCarga';
import { EstadoError } from '../../../core/components/EstadoError';
import { EstadoVacio } from '../../../core/components/EstadoVacio';
import { BotonPrimario } from '../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../core/components/CampoTexto';
import { theme } from '../../../core/config/theme';
import { capitalizar } from '../../../core/utils/texto';

import { usePagos } from '../hooks/usePagos';
import type { MedioPago } from '../types';

const MEDIOS: { valor: MedioPago; etiqueta: string }[] = [
  { valor: 'transferencia', etiqueta: 'Transferencia' },
  { valor: 'deposito', etiqueta: 'Depósito' },
  { valor: 'efectivo', etiqueta: 'Efectivo' },
  { valor: 'otro', etiqueta: 'Otro' },
];

function fechaHoy(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function periodoActual(): string {
  return fechaHoy().slice(0, 7);
}

function formatearMonto(monto: number, moneda: string): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }).format(monto);
}

function etiquetaEstado(estado: string): string {
  switch (estado) {
    case 'aprobado':
      return 'Aprobado';
    case 'rechazado':
      return 'Rechazado';
    default:
      return 'Pendiente';
  }
}

export function PagosScreen() {
  const { perfil } = useSession();
  const { consulta, registro } = usePagos();
  const hijos = perfil?.hijos ?? [];
  const [alumnoId, setAlumnoId] = useState('');
  const [periodo, setPeriodo] = useState(periodoActual);
  const [fechaPago, setFechaPago] = useState(fechaHoy);
  const [monto, setMonto] = useState('');
  const [medioPago, setMedioPago] = useState<MedioPago>('transferencia');
  const [referencia, setReferencia] = useState('');
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const informar = () => {
    const montoNumerico = Number(monto.replace(',', '.'));
    if (!alumnoId || !/^\d{4}-\d{2}$/.test(periodo) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaPago) || !Number.isFinite(montoNumerico) || montoNumerico <= 0) {
      setErrorFormulario('Revisá el alumno, el período, la fecha y el monto ingresados.');
      return;
    }
    if (referencia.length > 100) {
      setErrorFormulario('La referencia no puede superar los 100 caracteres.');
      return;
    }

    setErrorFormulario(null);
    registro.mutate({
      alumnoId,
      periodo,
      fechaPago,
      monto: montoNumerico,
      medioPago,
      ...(referencia.trim() ? { referencia: referencia.trim() } : {}),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl refreshing={consulta.isRefetching} onRefresh={() => void consulta.refetch()} />
        }
      >
        <Text style={styles.titulo}>Pagos</Text>
        <Text style={styles.aviso}>Informá un pago ya realizado. La app no realiza cobros.</Text>

        {!hijos.length ? (
          <EstadoVacio mensaje="No tenés alumnos vinculados para informar pagos." />
        ) : (
          <View style={styles.formulario}>
            <Text style={styles.etiqueta}>Alumno</Text>
            <View style={styles.opciones}>
              {hijos.map((hijo) => {
                const nombre = `${hijo.nombre} ${hijo.apellido}`.trim();
                return (
                  <Pressable
                    key={hijo.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: alumnoId === hijo.id }}
                    onPress={() => setAlumnoId(hijo.id)}
                    style={[styles.opcion, alumnoId === hijo.id && styles.opcionSeleccionada]}
                  >
                    <Text style={[styles.textoOpcion, alumnoId === hijo.id && styles.textoSeleccionado]}>
                      {nombre || hijo.id}
                    </Text>
                    {hijo.nivel ? <Text style={styles.detalle}>{capitalizar(hijo.nivel)}</Text> : null}
                  </Pressable>
                );
              })}
            </View>

            <CampoTexto
              label="Período (AAAA-MM)"
              value={periodo}
              onChangeText={setPeriodo}
              placeholder="2026-11"
              autoCapitalize="none"
              maxLength={7}
            />
            <CampoTexto
              label="Fecha del pago (AAAA-MM-DD)"
              value={fechaPago}
              onChangeText={setFechaPago}
              placeholder="2026-11-10"
              autoCapitalize="none"
              maxLength={10}
            />
            <CampoTexto
              label="Monto (ARS)"
              value={monto}
              onChangeText={setMonto}
              placeholder="25000"
              keyboardType="decimal-pad"
            />

            <Text style={styles.etiqueta}>Medio de pago</Text>
            <View style={styles.opcionesMedio}>
              {MEDIOS.map((medio) => (
                <Pressable
                  key={medio.valor}
                  accessibilityRole="button"
                  accessibilityState={{ selected: medioPago === medio.valor }}
                  onPress={() => setMedioPago(medio.valor)}
                  style={[styles.opcionMedio, medioPago === medio.valor && styles.opcionSeleccionada]}
                >
                  <Text style={[styles.textoOpcion, medioPago === medio.valor && styles.textoSeleccionado]}>
                    {medio.etiqueta}
                  </Text>
                </Pressable>
              ))}
            </View>

            <CampoTexto
              label="Referencia (opcional)"
              value={referencia}
              onChangeText={setReferencia}
              placeholder="Número de operación"
              maxLength={100}
            />
            {errorFormulario ? <Text style={styles.error}>{errorFormulario}</Text> : null}
            {registro.isError ? <EstadoError error={registro.error} onReintentar={informar} /> : null}
            {registro.isSuccess ? (
              <Text style={styles.exito}>Pago informado y pendiente de revisión.</Text>
            ) : null}
            <BotonPrimario
              titulo="Informar pago"
              onPress={informar}
              cargando={registro.isPending}
              deshabilitado={!hijos.length}
            />
          </View>
        )}

        <View style={styles.historial}>
          <Text style={styles.subtitulo}>Pagos informados</Text>
          {consulta.isLoading ? (
            <EstadoCarga />
          ) : consulta.isError ? (
            <EstadoError error={consulta.error} onReintentar={() => void consulta.refetch()} />
          ) : !consulta.data?.length ? (
            <EstadoVacio mensaje="Todavía no informaste pagos." />
          ) : (
            consulta.data.map((pago) => (
              <View key={pago.id} style={styles.filaPago}>
                <View style={styles.detallePago}>
                  <Text style={styles.nombreAlumno}>{pago.alumnoNombre}</Text>
                  <Text style={styles.detalle}>{pago.periodo} · {pago.fechaPago}</Text>
                  <Text style={styles.detalle}>{capitalizar(pago.medioPago)}</Text>
                </View>
                <View style={styles.resumenPago}>
                  <Text style={styles.montoPago}>{formatearMonto(pago.monto, pago.moneda)}</Text>
                  <Text style={[styles.estado, pago.estado === 'aprobado' && styles.estadoAprobado, pago.estado === 'rechazado' && styles.estadoRechazado]}>
                    {etiquetaEstado(pago.estado)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: theme.colores.fondo, flex: 1 },
  contenido: { gap: theme.espaciado.md, padding: theme.espaciado.md },
  titulo: { color: theme.colores.primario, fontSize: 26, fontWeight: '700' },
  subtitulo: { color: theme.colores.primario, fontSize: 20, fontWeight: '700' },
  aviso: { color: theme.colores.texto, fontSize: 15 },
  formulario: { gap: theme.espaciado.md },
  etiqueta: { color: theme.colores.texto, fontSize: 14, fontWeight: '600' },
  opciones: { gap: theme.espaciado.sm },
  opcion: { backgroundColor: theme.colores.superficie, borderColor: theme.colores.borde, borderRadius: 8, borderWidth: 1, gap: 2, padding: theme.espaciado.md },
  opcionSeleccionada: { backgroundColor: '#E8F1F8', borderColor: theme.colores.primario },
  textoOpcion: { color: theme.colores.texto, fontSize: 15, fontWeight: '600' },
  textoSeleccionado: { color: theme.colores.primario },
  opcionesMedio: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.espaciado.sm },
  opcionMedio: { backgroundColor: theme.colores.superficie, borderColor: theme.colores.borde, borderRadius: 8, borderWidth: 1, minHeight: 44, justifyContent: 'center', paddingHorizontal: theme.espaciado.md },
  detalle: { color: theme.colores.texto, fontSize: 13, opacity: 0.75 },
  error: { color: theme.colores.error, fontSize: 14 },
  exito: { color: '#23633B', fontSize: 15, fontWeight: '600' },
  historial: { borderTopColor: theme.colores.borde, borderTopWidth: 1, gap: theme.espaciado.md, paddingTop: theme.espaciado.md },
  filaPago: { alignItems: 'center', borderBottomColor: theme.colores.borde, borderBottomWidth: 1, flexDirection: 'row', gap: theme.espaciado.sm, justifyContent: 'space-between', paddingVertical: theme.espaciado.md },
  detallePago: { flex: 1, gap: 3 },
  nombreAlumno: { color: theme.colores.texto, fontSize: 16, fontWeight: '600' },
  resumenPago: { alignItems: 'flex-end', gap: 4 },
  montoPago: { color: theme.colores.primario, fontSize: 16, fontWeight: '700' },
  estado: { color: '#8A5A00', fontSize: 13, fontWeight: '600' },
  estadoAprobado: { color: '#23633B' },
  estadoRechazado: { color: theme.colores.error },
});