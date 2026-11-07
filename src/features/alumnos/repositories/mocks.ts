import type {
  Alumno,
  BloqueHorarioApi,
  DatosAcademicos,
  DiaHorarioApi,
  MateriaHorario,
} from '../types';

const nombresMaterias = [
  { codigo: 'MAT', nombre: 'Matemática' },
  { codigo: 'LEN', nombre: 'Lengua' },
  { codigo: 'CIE', nombre: 'Ciencias Naturales' },
  { codigo: 'HIS', nombre: 'Ciencias Sociales' },
] as const;

const nombresDocentes = ['Ana Torres', 'Luis Gómez', 'Marta Ruiz', 'Juan Díaz'] as const;

export function crearDatosAcademicosMock(id: string): DatosAcademicos {
  const alumno: Alumno = {
    id,
    legajo: `LEG-${id}`,
    nombre: `Alumno ${id}`,
    apellido: 'De prueba',
    email: 'alumno@example.test',
    nivel: 'primaria',
    estado: 'activo',
  };

  const materias: MateriaHorario[] = nombresMaterias.map((materia, index) => ({
    id: `${id}-materia-${index + 1}`,
    codigo: materia.codigo,
    nombre: materia.nombre,
  }));

  const bloques: BloqueHorarioApi[] = materias.map((materia, index) => ({
    id: `${id}-bloque-${index + 1}`,
    materiaId: materia.id,
    dia: Math.floor(index / 2) + 1,
    diaNombre: ['Lunes', 'Martes'][Math.floor(index / 2)],
    horaInicio: index % 2 === 0 ? '08:00' : '09:00',
    horaFin: index % 2 === 0 ? '08:50' : '09:50',
    aula: `Aula ${index + 1}`,
    docenteId: `${id}-docente-${index + 1}`,
    materiaCodigo: materia.codigo,
    materiaNombre: materia.nombre,
    docente: {
      id: `${id}-docente-${index + 1}`,
      nombre: nombresDocentes[index],
    },
  }));

  const dias: DiaHorarioApi[] = ['Lunes', 'Martes'].map((nombre, index) => ({
    dia: index + 1,
    nombre,
    bloques: bloques.filter((bloque) => bloque.dia === index + 1),
  }));

  return {
    alumno,
    materias: materias.map((materia) => ({
      ...materia,
      docente: bloques.find((bloque) => bloque.materiaId === materia.id)?.docente?.nombre ?? null,
    })),
    dias: dias.map((dia) => ({
      nombre: dia.nombre,
      bloques: dia.bloques.map((bloque) => ({
        materiaNombre: bloque.materiaNombre,
        horaInicio: bloque.horaInicio,
        horaFin: bloque.horaFin,
        aula: bloque.aula,
        docente: bloque.docente?.nombre ?? null,
      })),
    })),
  };
}
