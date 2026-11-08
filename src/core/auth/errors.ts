function firebaseErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }

  return typeof error.code === 'string' ? error.code : undefined;
}

export function traducirErrorAuth(error: unknown): string {
  switch (firebaseErrorCode(error)) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      return 'DNI o contraseña incorrectos';
    case 'auth/network-request-failed':
      return 'No se pudo conectar con el servidor. Revisá tu conexión.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos e intentá nuevamente.';
    case 'auth/api-key-not-valid':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/invalid-api-key':
    case 'auth/app-not-authorized':
    case 'auth/operation-not-allowed':
      return 'El inicio de sesión no está configurado correctamente. Contactá a soporte.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada. Contactá a la institución.';
    default:
      return 'No se pudo iniciar sesión. Intentá nuevamente.';
  }
}
