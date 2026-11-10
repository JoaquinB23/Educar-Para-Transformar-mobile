export type MedioPago = 'transferencia' | 'deposito' | 'efectivo' | 'otro';
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado';

export interface InformarPagoInput {
  alumnoId: string;
  periodo: string;
  fechaPago: string;
  monto: number;
  medioPago: MedioPago;
  referencia?: string;
}

export interface PagoRegistrado extends InformarPagoInput {
  id: string;
  moneda: string;
  estado: EstadoPago;
  nivelAlumno?: string;
}

export interface PagoListado {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  periodo: string;
  fechaPago: string;
  monto: number;
  moneda: string;
  medioPago: MedioPago;
  estado: EstadoPago;
  tipoPago: 'completo' | 'incompleto' | null;
}