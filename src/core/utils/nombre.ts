/**
 * Une las partes de un nombre descartando valores vacíos, null o undefined.
 * Si la primera parte ya trae el nombre completo (y el apellido no viene),
 * el resultado es esa misma cadena, sin agregar "undefined".
 */
export function nombreCompleto(...partes: (string | null | undefined)[]): string {
  return partes
    .map((parte) => parte?.trim())
    .filter((parte): parte is string => Boolean(parte))
    .join(' ');
}
