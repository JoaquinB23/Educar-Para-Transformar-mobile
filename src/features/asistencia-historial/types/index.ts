export type EstadoAsistenciaHistorial = 'presente' | 'tarde' | 'ausente';

/**
 * Registro tal como lo devuelve `GET /api/asistencias?alumnoId=...`.
 * La web solo usa `fecha` y `estado`; se conservan los demás campos para no
 * perder información del contrato.
 */
export interface AsistenciaHistorial {
  id: string;
  alumnoId: string;
  materiaId: string;
  fecha: string;
  estado: EstadoAsistenciaHistorial;
}

/**
 * Hijo vinculado al perfil de familia. `GET /api/auth/me` devuelve este
 * subconjunto dentro de `hijos` para el rol familia.
 */
export interface HijoVinculado {
  id: string;
  nombre: string;
  apellido: string;
  nivel: string | null;
  legajo: string | null;
}
