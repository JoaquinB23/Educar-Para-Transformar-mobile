const DOMINIO = '@escuela.edu.ar';

// El usuario ingresa el DNI (o el correo completo) y armamos el email
// institucional. Si ya viene con @ lo respetamos tal cual.
export function normalizarCorreo(valor: string): string {
  const texto = valor.trim().toLowerCase();
  if (!texto) return '';
  if (texto.includes('@')) return texto;

  const dni = texto.replace(/\D/g, '');
  return dni ? `${dni}${DOMINIO}` : '';
}
