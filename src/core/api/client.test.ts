import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { auth } from '../config/firebase';

import { api, setUnauthorizedHandler } from './client';

jest.mock('../config/env', () => ({
  env: { apiUrl: 'http://test.local/api' },
}));

jest.mock('../config/firebase', () => ({
  auth: { currentUser: null },
}));

type AuthMock = {
  currentUser: { getIdToken: (force?: boolean) => Promise<string> } | null;
};

function respuesta(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosResponse {
  return { data, status, statusText: String(status), headers: {}, config };
}

function error401(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError(
    'Unauthorized',
    'ERR_BAD_REQUEST',
    config,
    undefined,
    respuesta(config, 401, { error: 'no autorizado' }),
  );
}

const authMock = auth as unknown as AuthMock;

describe('api client', () => {
  let adapter: jest.MockedFunction<AxiosAdapter>;
  let unauthorized: jest.Mock;

  beforeEach(() => {
    adapter = jest.fn<AxiosAdapter>();
    api.defaults.adapter = adapter;

    unauthorized = jest.fn();
    setUnauthorizedHandler(unauthorized);

    authMock.currentUser = null;
  });

  it('envía el Bearer y desenvuelve la respuesta del backend', async () => {
    const getIdToken = jest.fn(async () => 'token-inicial');
    authMock.currentUser = { getIdToken };

    adapter.mockImplementation(async (config) =>
      respuesta(config, 200, { ok: true, data: { id: 'perfil-1' } }),
    );

    const response = await api.get<{ id: string }>('/auth/me');

    expect(response.data).toEqual({ id: 'perfil-1' });
    expect(getIdToken).toHaveBeenCalledTimes(1);
    expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer token-inicial');
    expect(unauthorized).not.toHaveBeenCalled();
  });

  it('renueva el token y reintenta una vez ante un 401', async () => {
    let token = 'token-inicial';
    const getIdToken = jest.fn(async (force?: boolean) => {
      if (force) token = 'token-renovado';
      return token;
    });
    authMock.currentUser = { getIdToken };

    adapter.mockImplementation(async (config) => {
      if (adapter.mock.calls.length === 1) throw error401(config);
      return respuesta(config, 200, { ok: true, data: { id: 'perfil-1' } });
    });

    const response = await api.get<{ id: string }>('/auth/me');

    expect(response.data).toEqual({ id: 'perfil-1' });
    expect(getIdToken).toHaveBeenCalledWith(true);
    expect(adapter.mock.calls[1][0].headers.get('Authorization')).toBe('Bearer token-renovado');
    expect(unauthorized).not.toHaveBeenCalled();
  });

  it('cierra la sesión si el 401 persiste después del reintento', async () => {
    const getIdToken = jest.fn(async (force?: boolean) => (force ? 'token-renovado' : 'token'));
    authMock.currentUser = { getIdToken };
    adapter.mockImplementation(async (config) => {
      throw error401(config);
    });

    await expect(api.get('/auth/me')).rejects.toMatchObject({ status: 401 });

    expect(getIdToken).toHaveBeenCalledWith(true);
    expect(unauthorized).toHaveBeenCalledTimes(1);
  });

  it('cierra la sesión si no hay usuario para reintentar el 401', async () => {
    adapter.mockImplementation(async (config) => {
      throw error401(config);
    });

    await expect(api.get('/auth/me')).rejects.toMatchObject({ status: 401 });

    expect(unauthorized).toHaveBeenCalledTimes(1);
  });
});
