export const ENDPOINTS_ALUMNOS = {
  alumno: (id: string) => `/alumnos/${encodeURIComponent(id)}`,
  horarios: (id: string) => `/horarios?alumnoId=${encodeURIComponent(id)}`,
} as const;
