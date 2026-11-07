import { StyleSheet, Text, View } from 'react-native';

import { EstadoVacio } from '../../../core/components/EstadoVacio';
import { theme } from '../../../core/config/theme';

import type { DatosAcademicos } from '../types';

interface DetalleAcademicoProps {
  datos: DatosAcademicos;
}

export function DetalleAcademico({ datos }: DetalleAcademicoProps) {
  const { alumno, materias, dias } = datos;

  return (
    <View style={styles.contenedor}>
      <View style={styles.seccion}>
        <Text style={styles.titulo}>Datos del alumno</Text>
        <Text style={styles.dato}>Nombre: {`${alumno.nombre} ${alumno.apellido}`.trim()}</Text>
        <Text style={styles.dato}>Legajo: {alumno.legajo}</Text>
        <Text style={styles.dato}>Nivel: {alumno.nivel ?? 'No informado'}</Text>
        <Text style={styles.dato}>Estado: {alumno.estado}</Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.titulo}>Materias</Text>
        {materias.length === 0 ? (
          <EstadoVacio mensaje="Sin materias en el ciclo actual" />
        ) : (
          materias.map((materia) => (
            <View key={materia.id} style={styles.item}>
              <Text style={styles.nombre}>{materia.nombre}</Text>
              <Text style={styles.dato}>Código: {materia.codigo}</Text>
              <Text style={styles.dato}>Docente: {materia.docente ?? 'Sin docente asignado'}</Text>
            </View>
          ))
        )}
      </View>

      {materias.length > 0 && (
        <View style={styles.seccion}>
          <Text style={styles.titulo}>Horario semanal</Text>
          {dias.map((dia) => (
            <View key={dia.nombre} style={styles.item}>
              <Text style={styles.nombre}>{dia.nombre}</Text>
              {dia.bloques.length === 0 ? (
                <Text style={styles.dato}>Sin clases</Text>
              ) : (
                dia.bloques.map((bloque, index) => (
                  <View key={`${dia.nombre}-${bloque.horaInicio}-${index}`} style={styles.bloque}>
                    <Text style={styles.dato}>
                      {bloque.horaInicio}–{bloque.horaFin} · {bloque.materiaNombre}
                    </Text>
                    <Text style={styles.dato}>Aula: {bloque.aula ?? 'No informada'}</Text>
                  </View>
                ))
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: theme.espaciado.md,
  },
  seccion: {
    backgroundColor: theme.colores.superficie,
    borderRadius: 8,
    gap: theme.espaciado.sm,
    padding: theme.espaciado.md,
  },
  titulo: {
    color: theme.colores.primario,
    fontSize: 20,
    fontWeight: '700',
  },
  item: {
    borderTopColor: theme.colores.borde,
    borderTopWidth: 1,
    gap: theme.espaciado.xs,
    paddingTop: theme.espaciado.sm,
  },
  bloque: {
    gap: theme.espaciado.xs,
    paddingVertical: theme.espaciado.xs,
  },
  nombre: {
    color: theme.colores.texto,
    fontSize: 16,
    fontWeight: '600',
  },
  dato: {
    color: theme.colores.texto,
    fontSize: 15,
  },
});
