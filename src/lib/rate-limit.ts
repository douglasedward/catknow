import { headers } from 'next/headers';
import { APIError } from './api-utils';

const requests = new Map<string, number[]>();

export function rateLimit(limit: number, windowMs: number = 60000) {
  return async function checkRateLimit() {
    try {
      const headersList = await headers();
      const forwardedFor = headersList.get('x-forwarded-for');
      const ip = forwardedFor || 'unknown';
      const now = Date.now();

      const timestamps = requests.get(ip) || [];
      const recentRequests = timestamps.filter((t) => now - t < windowMs);

      if (recentRequests.length >= limit) {
        throw new APIError({
          message: 'Too many requests',
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }

      recentRequests.push(now);
      requests.set(ip, recentRequests);
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw APIError.fromError(error);
    }
  };
}
