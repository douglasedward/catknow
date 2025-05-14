import { NextRequest } from 'next/server';
import { fetchWithCache, errorHandler } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

const checkRateLimit = rateLimit(60); // 60 requests per minute

export async function GET(req: NextRequest) {
  try {
    await checkRateLimit();

    const data = await fetchWithCache(
      'https://api.thecatapi.com/v1/categories',
      {
        headers: {
          'x-api-key': process.env.API_KEY!,
          'Content-Type': 'application/json'
        }
      }
    );

    return Response.json(data);
  } catch (error) {
    return errorHandler(error);
  }
}
