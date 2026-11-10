import { api } from '../../../core/api/client';
import { ApiError } from '../../../core/api/errors';

import { ENDPOINTS_DOCENTES } from './endpoints';
import type {
  AlumnoAsignado,
  AsistenciaGuardada,
  MateriaAsignada,
  RegistroAsistencia,
  ResultadoAsistencia,
} from '../types';

interface PerfilDocenteApi {
  docenteId?: string | null;
  cicloLectivoActual?: number | null;
}

interface MateriaResumenApi {
  id: string;
  codigo?: string | null;
  nombre?: string | null;
  nivel?: string | null;
}

interface MateriaDocenteApi extends MateriaResumenApi {
  docenteId?: string | null;
  cicloLectivo?: number | null;
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

function normalizarMateria(materia: MateriaResumenApi): MateriaAsignada {
  return {
    id: materia.id,
    codigo: materia.codigo ?? '',
    nombre: materia.nombre ?? '',
    nivel: materia.nivel ?? null,
    alumnos: [],
  };
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

function ordenarMaterias(a: MateriaAsignada, b: MateriaAsignada): number {
  return (
    a.nombre.localeCompare(b.nombre, 'es') || a.codigo.localeCompare(b.codigo, 'es')
  );
}

export function agruparPorMateria(alumnos: AlumnoAsignadoApi[]): MateriaAsignada[] {
  const porMateria = new Map<string, MateriaAsignada>();

  for (const alumno of alumnos) {
    for (const materia of alumno.materias ?? []) {
      let asignada = porMateria.get(materia.id);

      if (!asignada) {
        asignada = normalizarMateria(materia);
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
      alumnos: [...materia.alumnos].sort(ordenarAlumnos),
    }))
    .sort(ordenarMaterias);
}

/**
 * Deja solamente las materias cuyo docenteId coincide con el docente
 * autenticado. El listado de /api/materias no está acotado por usuario, así
 * que el filtro es imprescindible para no mostrar asignaciones ajenas.
 */
export function filtrarMateriasDelDocente(
  materias: MateriaDocenteApi[],
  docenteId: string | null | undefined,
): MateriaAsignada[] {
  if (!docenteId) return [];

  return materias
    .filter((materia) => materia.docenteId === docenteId)
    .map(normalizarMateria);
}

/**
 * Combina las materias asignadas (aunque todavía no tengan inscriptos) con los
 * alumnos que devuelve el endpoint server-scoped /api/docentes/alumnos.
 */
export function combinarAsignaciones(
  asignadas: MateriaAsignada[],
  alumnos: AlumnoAsignadoApi[],
): MateriaAsignada[] {
  const combinadas = new Map(
    agruparPorMateria(alumnos).map((materia) => [materia.id, materia]),
  );

  for (const materia of asignadas) {
    const agrupada = combinadas.get(materia.id);
    combinadas.set(materia.id, { ...materia, alumnos: agrupada?.alumnos ?? [] });
  }

  return [...combinadas.values()]
    .map((materia) => ({
      ...materia,
      alumnos: [...materia.alumnos].sort(ordenarAlumnos),
    }))
    .sort(ordenarMaterias);
}

export async function obtenerAsignaciones(): Promise<MateriaAsignada[]> {
  const perfilResponse = await api.get<PerfilDocenteApi>(ENDPOINTS_DOCENTES.perfil);
  const { docenteId, cicloLectivoActual } = perfilResponse.data;

  if (!docenteId) {
    throw new ApiError(403, 'La cuenta no está vinculada a un registro de docente');
  }

  const [materiasResponse, alumnosResponse] = await Promise.all([
    api.get<MateriaDocenteApi[]>(ENDPOINTS_DOCENTES.materias, {
      params: cicloLectivoActual ? { cicloLectivo: cicloLectivoActual } : undefined,
    }),
    api.get<AlumnoAsignadoApi[]>(ENDPOINTS_DOCENTES.asignaciones),
  ]);

  return combinarAsignaciones(
    filtrarMateriasDelDocente(materiasResponse.data, docenteId),
    alumnosResponse.data,
  );
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
