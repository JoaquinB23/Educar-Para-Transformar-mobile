import { api } from '../../../core/api/client';

import { ENDPOINTS_SALUD } from './endpoints';
import { crearFichaMedicaMock } from './mocks';
import type { ContactoEmergencia, FichaMedicaRespuesta } from '../types';

function esObjeto(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizarContacto(
  contacto: ContactoEmergencia | string | null | undefined,
): ContactoEmergencia | string | null {
  if (typeof contacto === 'string') {
    return contacto;
  }

  if (!esObjeto(contacto)) {
    return null;
  }

  const nombre = typeof contacto.nombre === 'string' ? contacto.nombre : undefined;
  const telefono = typeof contacto.telefono === 'string' ? contacto.telefono : undefined;

  return nombre || telefono ? { nombre, telefono } : null;
}

function fechaDescendente(a: string, b: string): number {
  const fechaA = Date.parse(a);
  const fechaB = Date.parse(b);

  if (Number.isFinite(fechaA) && Number.isFinite(fechaB) && fechaA !== fechaB) {
    return fechaB - fechaA;
  }

  return b.localeCompare(a);
}

function normalizarFicha(respuesta: FichaMedicaRespuesta): FichaMedicaRespuesta {
  if (!respuesta.ficha) {
    return respuesta;
  }

  const ficha = respuesta.ficha;
  return {
    ...respuesta,
    ficha: {
      ...ficha,
      alergias: Array.isArray(ficha.alergias)
        ? ficha.alergias.filter((alergia): alergia is string => typeof alergia === 'string')
        : [],
      condiciones: Array.isArray(ficha.condiciones)
        ? ficha.condiciones.filter(
            (condicion): condicion is string => typeof condicion === 'string',
          )
        : [],
      contactoEmergencia: normalizarContacto(ficha.contactoEmergencia),
      atenciones: (Array.isArray(ficha.atenciones) ? ficha.atenciones : [])
        .slice()
        .sort(
          (a, b) =>
            fechaDescendente(a.fecha, b.fecha) ||
            fechaDescendente(a.registradaEn ?? '', b.registradaEn ?? ''),
        ),
    },
  };
}

export async function obtenerFicha(alumnoId: string): Promise<FichaMedicaRespuesta> {
  if (__DEV__ && process.env.EXPO_PUBLIC_MOCK_DATA === 'true') {
    return normalizarFicha(crearFichaMedicaMock(alumnoId));
  }

  const response = await api.get<FichaMedicaRespuesta>(ENDPOINTS_SALUD.ficha(alumnoId));
  return normalizarFicha(response.data);
}
