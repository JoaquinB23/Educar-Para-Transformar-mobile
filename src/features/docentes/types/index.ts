export interface MateriaResumen {
  id: string;
  codigo: string;
  nombre: string;
  nivel: string | null;
}

export interface AlumnoAsignado {
  id: string;
  nombre: string;
  apellido: string;
  legajo: string | null;
  nivel: string | null;
  estado: string | null;
}

export interface MateriaAsignada extends MateriaResumen {
  alumnos: AlumnoAsignado[];
}

export type EstadoAsistencia = 'presente' | 'tarde' | 'ausente';

export interface RegistroAsistencia {
  alumnoId: string;
  estado: EstadoAsistencia;
}

export interface AsistenciaGuardada {
  id: string;
  alumnoId: string;
  materiaId: string;
  fecha: string;
  estado: EstadoAsistencia;
}

export interface AsistenciaDescartada {
  registro: unknown;
  motivo: string;
}

export interface AvisosAsistencia {
  generadas: number;
  sinTutor: string[];
}

export interface ResultadoAsistencia {
  registros: AsistenciaGuardada[];
  descartados: AsistenciaDescartada[];
  avisos: AvisosAsistencia;
}
