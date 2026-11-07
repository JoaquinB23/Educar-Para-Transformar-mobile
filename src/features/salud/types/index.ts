export interface AlumnoFichaMedica {
  id: string;
  legajo?: string;
  nombre?: string;
  apellido?: string;
  estado?: string;
}

export interface ContactoEmergencia {
  nombre?: string;
  telefono?: string;
}

export interface Atencion {
  id: string;
  fecha: string;
  motivo: string;
  diagnostico?: string | null;
  tratamiento?: string | null;
  observaciones?: string | null;
  registradoPor?: string;
  registradoPorRol?: string;
  registradaEn?: string;
}

export interface FichaMedica {
  id: string;
  alumnoId: string;
  grupoSanguineo?: string | null;
  alergias: string[];
  condiciones: string[];
  medicacion?: string | null;
  contactoEmergencia?: ContactoEmergencia | string | null;
  observaciones?: string | null;
  actualizadoEn?: string;
  creadoEn?: string;
  atenciones: Atencion[];
}

export interface FichaMedicaRespuesta {
  alumno: AlumnoFichaMedica;
  ficha: FichaMedica | null;
  mensaje?: string;
}
