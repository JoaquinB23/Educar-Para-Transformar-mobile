import { crearFichaMedicaMock } from '../../salud/repositories/mocks';
import type { Perfil } from '../../../core/auth/types';
import type { NotificacionesRespuesta } from '../types';

export function crearNotificacionesMock(perfil: Perfil): NotificacionesRespuesta {
  const alumnoId = perfil.hijoIds[0] ?? 'mock-hijo-1';
  const atencion = crearFichaMedicaMock(alumnoId).ficha?.atenciones[0];
  if (!atencion) {
    throw new Error('No se pudo crear el mock de la notificación de atención.');
  }

  const notificaciones = [
    {
      id: 'mock-notificacion-atencion',
      destinatarioUid: perfil.id,
      tipo: 'atencion',
      titulo: 'Atención en enfermería',
      mensaje: `Se registró una atención de ${crearFichaMedicaMock(alumnoId).alumno.nombre ?? 'un alumno'} el ${atencion.fecha}. Consultá el detalle en la app.`,
      alumnoId,
      atencionId: atencion.id,
      fecha: atencion.fecha,
      leida: false,
      creadaEn: '2025-03-10T12:00:00.000Z',
    },
    {
      id: 'mock-notificacion-ausencia',
      destinatarioUid: perfil.id,
      tipo: 'ausencia',
      titulo: 'Aviso de ausencia',
      mensaje: 'Se registró una ausencia. Consultá el detalle en la app.',
      alumnoId,
      asistenciaId: 'mock-asistencia-1',
      fecha: '2025-03-09',
      leida: true,
      creadaEn: '2025-03-09T12:00:00.000Z',
      leidaEn: '2025-03-09T13:00:00.000Z',
    },
  ] as const;

  return {
    notificaciones: [...notificaciones],
    sinLeer: notificaciones.filter((notificacion) => !notificacion.leida).length,
  };
}
