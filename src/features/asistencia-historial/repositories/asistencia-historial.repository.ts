import { api } from '../../../core/api/client';
import { ApiError } from '../../../core/api/errors';

import { ENDPOINTS_ASISTENCIA_HISTORIAL } from './endpoints';
import type {
  AsistenciaHistorial,
  EstadoAsistenciaHistorial,
  HijoVinculado,
} from '../types';

interface AsistenciaHistorialApi {
  id: string;
  alumnoId: string;
  materiaId: string;
  fecha: string;
  estado: string;
}

interface HijoApi {
  id?: string | null;
  nombre?: string | null;
  apellido?: string | null;
  nivel?: string | null;
  legajo?: string | null;
}

interface PerfilConHijosApi {
  hijos?: HijoApi[] | null;
}

function normalizarEstado(estado: string): EstadoAsistenciaHistorial {
  return estado.toLowerCase() as EstadoAsistenciaHistorial;
}

/**
 * Historial de un alumno. La web usa exactamente este endpoint y parámetro
 * (`GET /api/asistencias?alumnoId=...`) y ordena por fecha descendente.
 *
 * Nota de seguridad: el backend no valida que el alumno pertenezca al usuario
 * autenticado. El acotamiento por rol se hace en el cliente con
 * `perfil.alumnoId` / `perfil.hijoIds`.
 */
export async function obtenerHistorialAsistencia(
  alumnoId: string,
): Promise<AsistenciaHistorial[]> {
  if (!alumnoId) {
    throw new ApiError(400, 'Seleccioná un alumno.');
  }

  const response = await api.get<AsistenciaHistorialApi[]>(
    ENDPOINTS_ASISTENCIA_HISTORIAL.asistencias,
    { params: { alumnoId } },
  );

  return response.data
    .map((registro) => ({
      id: registro.id,
      alumnoId: registro.alumnoId,
      materiaId: registro.materiaId,
      fecha: registro.fecha,
      estado: normalizarEstado(registro.estado),
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Hijos vinculados que el backend asocia al perfil de familia. El endpoint
 * `/api/auth/me` arma `hijos` a partir de `hijoPrimariaId` e
 * `hijoSecundariaId` del propio perfil, por lo que no acepta ids ajenos.
 */
export async function obtenerHijos(): Promise<HijoVinculado[]> {
  const response = await api.get<PerfilConHijosApi>(ENDPOINTS_ASISTENCIA_HISTORIAL.perfil);

  return (response.data.hijos ?? [])
    .filter((hijo): hijo is HijoApi & { id: string } => Boolean(hijo.id))
    .map((hijo) => ({
      id: hijo.id,
      nombre: hijo.nombre ?? '',
      apellido: hijo.apellido ?? '',
      nivel: hijo.nivel ?? null,
      legajo: hijo.legajo ?? null,
    }));
}


