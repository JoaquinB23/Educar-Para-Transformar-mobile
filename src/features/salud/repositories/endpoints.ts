export const ENDPOINTS_SALUD = {
  ficha: (alumnoId: string) => `/fichas-medicas?alumnoId=${encodeURIComponent(alumnoId)}`,
} as const;
