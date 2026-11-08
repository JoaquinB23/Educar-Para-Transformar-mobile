export const ENDPOINTS_NOTIFICACIONES = {
  listar: '/notificaciones',
  marcarLeida: (id: string) => `/notificaciones/${encodeURIComponent(id)}/leida`,
  registrarToken: '/push-token',
  eliminarToken: '/push-token',
} as const;
