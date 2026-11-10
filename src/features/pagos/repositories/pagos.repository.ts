import { api } from '../../../core/api/client';

import type { InformarPagoInput, PagoListado, PagoRegistrado } from '../types';

export async function listarPagos(): Promise<PagoListado[]> {
  const response = await api.get<PagoListado[]>('/pagos');
  return response.data;
}

export async function informarPago(pago: InformarPagoInput): Promise<PagoRegistrado> {
  const response = await api.post<PagoRegistrado>('/pagos', pago);
  return response.data;
}