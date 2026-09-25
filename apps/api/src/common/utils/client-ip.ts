import type { Request } from 'express';

/// Caller address as appended by API Gateway to X-Forwarded-For.
export function clientIpOf(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];
  const chain = Array.isArray(forwarded) ? forwarded.join(',') : forwarded;
  const last = chain?.split(',').pop()?.trim();
  return last || request.socket.remoteAddress || 'unknown';
}
