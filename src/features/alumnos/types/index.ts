export type Nivel = 'primaria' | 'secundaria';

export interface Alumno {
  id: string;
  legajo: string;
  nombre: string;
  apellido: string;
  email: string;
  nivel?: Nivel | null;
  estado: string;
}

export interface MateriaHorario {
  id: string;
  codigo: string;
  nombre: string;
}

export interface DocenteHorario {
  id: string;
  nombre: string;
}

export interface BloqueHorarioApi {
  id: string;
  materiaId: string;
  dia: number;
  diaNombre: string;
  horaInicio: string;
  horaFin: string;
  aula: string | null;
  docenteId: string | null;
  materiaCodigo: string;
  materiaNombre: string;
  docente: DocenteHorario | null;
}

export interface DiaHorarioApi {
  dia: number;
  nombre: string;
  bloques: BloqueHorarioApi[];
}

export interface HorariosApi {
  dias: DiaHorarioApi[];
  bloques: BloqueHorarioApi[];
  materias: MateriaHorario[];
  alumnos: string[];
}

export interface MateriaAcademica {
  id: string;
  codigo: string;
  nombre: string;
  docente: string | null;
}

export interface BloqueAcademico {
  materiaNombre: string;
  horaInicio: string;
  horaFin: string;
  aula: string | null;
  docente: string | null;
}

export interface DiaAcademico {
  nombre: string;
  bloques: BloqueAcademico[];
}

export interface DatosAcademicos {
  alumno: Alumno;
  materias: MateriaAcademica[];
  dias: DiaAcademico[];
}

export interface Hijo {
  id: string;
  nombre: string;
}
