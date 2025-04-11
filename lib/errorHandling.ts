export class SecretManagerError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'SecretManagerError';
  }
}

export function handleSecretManagerError(error: unknown, secretName: string): never {
  console.error(`Secret Manager error for ${secretName}:`, error);
  
  // Log detailed error information for debugging
  if (error instanceof Error) {
    console.error(`Stack trace: ${error.stack}`);
  }
  
  throw new SecretManagerError(
    `Failed to access secret ${secretName}. Check service account permissions and secret existence.`,
    error instanceof Error ? error : undefined
  );
}
