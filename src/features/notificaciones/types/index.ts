export type TipoNotificacion = 'ausencia' | 'atencion' | (string & {});

export interface Notificacion {
  id: string;
  destinatarioUid: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  alumnoId?: string;
  asistenciaId?: string;
  atencionId?: string;
  materiaId?: string;
  fecha?: string;
  leida: boolean;
  creadaEn: string;
  leidaEn?: string | null;
}

export interface NotificacionesRespuesta {
  notificaciones: Notificacion[];
  sinLeer: number;
}
