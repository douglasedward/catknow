import { NextResponse } from 'next/server';

export interface APIErrorData {
  code: string;
  message: string;
  status: number;
}

export class APIError extends Error {
  public code: string;
  public status: number;

  constructor({ message, status, code }: APIErrorData) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
  }

  static fromResponse(response: Response): APIError {
    return new APIError({
      message: response.statusText || 'API request failed',
      status: response.status,
      code: 'EXTERNAL_API_ERROR'
    });
  }

  static fromError(error: unknown): APIError {
    if (error instanceof APIError) return error;

    return new APIError({
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500,
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const memoryCache = new Map<string, { data: any; timestamp: number }>();

const isBrowser = typeof window !== 'undefined';

async function getCachedData(url: string) {
  if (isBrowser && 'caches' in window) {
    try {
      const cache = await caches.open('catknow-api-cache');
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        const data = await cachedResponse.json();
        const cacheTime = new Date(
          cachedResponse.headers.get('cache-time') || ''
        );

        if (Date.now() - cacheTime.getTime() < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Browser cache error:', error);
    }
  } else {
    const cached = memoryCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }
  return null;
}

async function setCachedData(url: string, data: any) {
  if (isBrowser && 'caches' in window) {
    try {
      const cache = await caches.open('catknow-api-cache');
      const headers = new Headers({
        'cache-time': new Date().toISOString(),
        'content-type': 'application/json'
      });
      await cache.put(url, new Response(JSON.stringify(data), { headers }));
    } catch (error) {
      console.warn('Browser cache error:', error);
    }
  } else {
    memoryCache.set(url, {
      data,
      timestamp: Date.now()
    });
  }
}

export async function fetchWithCache(
  url: string,
  init?: RequestInit & { bypassCache?: boolean }
): Promise<any> {
  const shouldCache =
    !init?.bypassCache && (!init?.method || init.method === 'GET');

  if (!shouldCache) {
    return fetch(url, init).then((res) => res.json());
  }

  try {
    const cachedData = await getCachedData(url);
    if (cachedData) {
      return cachedData;
    }

    const response = await fetch(url, init);
    if (!response.ok) {
      throw APIError.fromResponse(response);
    }

    const data = await response.json();
    await setCachedData(url, data);
    return data;
  } catch (error) {
    throw APIError.fromError(error);
  }
}

export function errorHandler(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  const apiError = APIError.fromError(error);
  return NextResponse.json(
    { error: apiError.message, code: apiError.code },
    { status: apiError.status }
  );
}
