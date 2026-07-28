import { ApiError } from '@hatohui/models';

export type ErrorCategory =
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'network'
  | 'server'
  | 'validation'
  | 'unknown';

/**
 * Maps a caught error to a stable category so callers can look up a
 * translated message (e.g. `t(\`common:errors.${category}\`)`) instead of
 * displaying the raw (English, backend-internal) error message.
 */
export function getErrorCategory(error: unknown): ErrorCategory {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'unauthorized';
    if (error.status === 403) return 'forbidden';
    if (error.status === 404) return 'notFound';
    if (error.status === 400 || error.status === 422) return 'validation';
    if (error.status >= 500) return 'server';
    return 'unknown';
  }

  // fetch() rejects with a TypeError for network-level failures (offline,
  // DNS, CORS preflight rejection) rather than an HTTP response.
  if (error instanceof TypeError) return 'network';

  return 'unknown';
}
