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
