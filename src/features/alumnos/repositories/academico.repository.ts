import { api } from '../../../core/api/client';

import { ENDPOINTS_ALUMNOS } from './endpoints';
import { crearDatosAcademicosMock } from './mocks';
import type { Alumno, DatosAcademicos, HorariosApi } from '../types';

export async function obtenerAlumno(id: string): Promise<Alumno> {
  if (__DEV__ && process.env.EXPO_PUBLIC_MOCK_DATA === 'true') {
    return crearDatosAcademicosMock(id).alumno;
  }

  const response = await api.get<Alumno>(ENDPOINTS_ALUMNOS.alumno(id));
  return response.data;
}

export async function obtenerDatosAcademicos(id: string): Promise<DatosAcademicos> {
  if (__DEV__ && process.env.EXPO_PUBLIC_MOCK_DATA === 'true') {
    return crearDatosAcademicosMock(id);
  }

  const [alumno, horariosResponse] = await Promise.all([
    api.get<Alumno>(ENDPOINTS_ALUMNOS.alumno(id)),
    api.get<HorariosApi>(ENDPOINTS_ALUMNOS.horarios(id)),
  ]);
  const horarios = horariosResponse.data;

  return {
    alumno: alumno.data,
    materias: horarios.materias.map((materia) => ({
      ...materia,
      docente:
        horarios.bloques.find((bloque) => bloque.materiaId === materia.id)?.docente?.nombre ?? null,
    })),
    dias: horarios.dias.map((dia) => ({
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
