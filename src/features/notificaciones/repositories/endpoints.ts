export const ENDPOINTS_NOTIFICACIONES = {
  listar: '/notificaciones',
  marcarLeida: (id: string) => `/notificaciones/${encodeURIComponent(id)}/leida`,
} as const;
