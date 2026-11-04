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
      return 'Correo o contraseña incorrectos';
    case 'auth/network-request-failed':
      return 'No se pudo conectar con el servidor';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intentá nuevamente más tarde.';
    default:
      return 'No se pudo iniciar sesión. Intentá nuevamente.';
  }
}
