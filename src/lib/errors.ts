type ErrorWithCode = {
  code?: string;
};

export function isDbUnavailable(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as ErrorWithCode;
    return code === 'P1001';
  }
  return false;
}


