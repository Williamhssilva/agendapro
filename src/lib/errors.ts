export function isDbUnavailable(error: unknown): boolean {
  // PrismaClientKnownRequestError has code property
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as any).code;
    return code === 'P1001';
  }
  return false;
}


