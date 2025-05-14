import { NextRequest } from 'next/server';
import { fetchWithCache, errorHandler } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

const checkRateLimit = rateLimit(60); // 60 requests per minute

function buildExternalQuery(req: NextRequest): string {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '0';
  const limit = searchParams.get('limit') || '10';
  const categoryIds = searchParams.get('category_ids');
  const hasBreeds = searchParams.get('has_breeds');

  if (isNaN(Number(page)) || isNaN(Number(limit))) {
    throw new Error('Invalid page or limit parameter');
  }

  if (Number(limit) > 100) {
    throw new Error('Limit cannot exceed 100');
  }

  const params = new URLSearchParams({
    page,
    limit,
    ...(categoryIds ? { category_ids: categoryIds } : {}),
    ...(hasBreeds ? { has_breeds: hasBreeds } : {})
  });

  return params.toString();
}

export async function GET(req: NextRequest) {
  try {
    await checkRateLimit();

    const query = buildExternalQuery(req);
    const data = await fetchWithCache(
      `https://api.thecatapi.com/v1/images/search?${query}`,
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
