export const FORBIDDEN_ERROR_CODE = 'FORBIDDEN';

export const isForbiddenError = (error: unknown): boolean =>
  (error as { extensions?: { code?: unknown } | null } | null | undefined)
    ?.extensions?.code === FORBIDDEN_ERROR_CODE;
