const DOMINIO = '@escuela.edu.ar';

// El DNI es la credencial visible en toda la app. El email institucional sólo
// existe para Firebase y se arma acá, en un único lugar.
export function dniAEmail(dni: string): string {
  const limpio = dni.replace(/\s/g, '');
  if (!/^\d+$/.test(limpio)) return '';
  return `${limpio}${DOMINIO}`;
}

// Para mostrar el DNI en el perfil a partir del email que devuelve el backend.
export function dniDesdeEmail(email: string): string {
  return email.split('@')[0] ?? '';
}
