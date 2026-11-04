import { create, isAxiosError } from 'axios';

import { auth } from '../config/firebase';
import { env } from '../config/env';

import { normalizarError } from './errors';

declare module 'axios' {
  interface AxiosRequestConfig {
    _authRetried?: boolean;
  }
}

export const api = create({
  baseURL: env.apiUrl,
  timeout: 15_000,
});

let unauthorizedHandler: (() => void) | undefined;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler ?? undefined;
}

function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}

api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error)) {
      throw normalizarError(error);
    }

    const config = error.config;
    if (error.response?.status !== 401 || !config || config._authRetried) {
      if (error.response?.status === 401 && config?._authRetried) {
        notifyUnauthorized();
      }

      throw normalizarError(error);
    }

    config._authRetried = true;
    const currentUser = auth.currentUser;

    if (!currentUser) {
      notifyUnauthorized();
      throw normalizarError(error);
    }

    let token: string;
    try {
      token = await currentUser.getIdToken(true);
    } catch {
      notifyUnauthorized();
      throw normalizarError(error);
    }

    config.headers.set('Authorization', `Bearer ${token}`);
    return api.request(config);
  },
);
