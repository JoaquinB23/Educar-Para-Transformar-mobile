import { isAxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function responseMessage(data: unknown): string | undefined {
  if (!isRecord(data)) {
    return undefined;
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }

  return undefined;
}

export function normalizarError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return new ApiError(0, 'No se pudo conectar con el servidor');
  }

  if (!error.response) {
    return new ApiError(0, 'No se pudo conectar con el servidor', error.code);
  }

  const body = error.response.data;
  const code = isRecord(body) && typeof body.code === 'string' ? body.code : error.code;

  return new ApiError(
    error.response.status,
    responseMessage(body) ?? 'Ocurrió un error al comunicarse con el servidor',
    code,
  );
}
