const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function parseFecha(fecha: string): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export function aFechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function hoyISO(): string {
  return aFechaISO(new Date());
}

export function sumarDias(fecha: string, dias: number): string {
  const valor = parseFecha(fecha);
  valor.setDate(valor.getDate() + dias);
  return aFechaISO(valor);
}

export function fechaLegible(fecha: string): string {
  const valor = parseFecha(fecha);
  return `${DIAS[valor.getDay()]} ${valor.getDate()} ${MESES[valor.getMonth()]} ${valor.getFullYear()}`;
}
