import { api } from '../../../core/api/client';

import { ENDPOINTS_DOCENTES } from './endpoints';
import type {
  AlumnoAsignado,
  AsistenciaGuardada,
  MateriaAsignada,
  RegistroAsistencia,
  ResultadoAsistencia,
} from '../types';

interface MateriaResumenApi {
  id: string;
  codigo?: string | null;
  nombre?: string | null;
  nivel?: string | null;
}

interface AlumnoAsignadoApi {
  id: string;
  nombre?: string | null;
  apellido?: string | null;
  legajo?: string | null;
  nivel?: string | null;
  estado?: string | null;
  materias?: MateriaResumenApi[] | null;
}

function normalizarAlumno(alumno: AlumnoAsignadoApi): AlumnoAsignado {
  return {
    id: alumno.id,
    nombre: alumno.nombre ?? '',
    apellido: alumno.apellido ?? '',
    legajo: alumno.legajo ?? null,
    nivel: alumno.nivel ?? null,
    estado: alumno.estado ?? null,
  };
}

function ordenarAlumnos(a: AlumnoAsignado, b: AlumnoAsignado): number {
  return `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es');
}

export function agruparPorMateria(alumnos: AlumnoAsignadoApi[]): MateriaAsignada[] {
  const porMateria = new Map<string, MateriaAsignada>();

  for (const alumno of alumnos) {
    for (const materia of alumno.materias ?? []) {
      let asignada = porMateria.get(materia.id);

      if (!asignada) {
        asignada = {
          id: materia.id,
          codigo: materia.codigo ?? '',
          nombre: materia.nombre ?? '',
          nivel: materia.nivel ?? null,
          alumnos: [],
        };
        porMateria.set(materia.id, asignada);
      }

      if (!asignada.alumnos.some((item) => item.id === alumno.id)) {
        asignada.alumnos.push(normalizarAlumno(alumno));
      }
    }
  }

  return [...porMateria.values()]
    .map((materia) => ({
      ...materia,
      alumnos: materia.alumnos.sort(ordenarAlumnos),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export async function obtenerAsignaciones(): Promise<MateriaAsignada[]> {
  const response = await api.get<AlumnoAsignadoApi[]>(ENDPOINTS_DOCENTES.asignaciones);
  return agruparPorMateria(response.data);
}

export async function obtenerAsistencias(
  materiaId: string,
  fecha: string,
): Promise<AsistenciaGuardada[]> {
  const response = await api.get<AsistenciaGuardada[]>(ENDPOINTS_DOCENTES.asistencias, {
    params: { materiaId, fecha },
  });
  return response.data;
}

export async function guardarAsistencia(payload: {
  materiaId: string;
  fecha: string;
  registros: RegistroAsistencia[];
}): Promise<ResultadoAsistencia> {
  const response = await api.post<ResultadoAsistencia>(ENDPOINTS_DOCENTES.asistencias, payload);
  return response.data;
}
