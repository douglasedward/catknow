import { ICatService } from './ICatService';
import type { Cat, Category } from '@/types';
import { APIError } from '@/lib/api-utils';

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export class CatService implements ICatService {
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly baseUrl: string;

  constructor() {
    this.cache = new Map();
    this.baseUrl =
      typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        : '';
  }

  private async fetchWithCache<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const cacheKey = url;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
      return cached.data as T;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      });

      if (!response.ok) {
        throw APIError.fromResponse(response);
      }

      const data = await response.json();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.fromError(error);
    }
  }

  private buildCatQuery(
    page: number,
    limit: number,
    categoryId?: string
  ): URLSearchParams {
    return new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(categoryId ? { category_ids: categoryId } : { has_breeds: '1' })
    });
  }

  async getCategories(): Promise<Category[]> {
    return this.fetchWithCache<Category[]>(`${this.baseUrl}/api/categories`);
  }

  async getCats(
    page: number,
    limit: number,
    categoryId?: string
  ): Promise<Cat[]> {
    const query = this.buildCatQuery(page, limit, categoryId);
    return this.fetchWithCache<Cat[]>(
      `${this.baseUrl}/api/cats?${query.toString()}`
    );
  }

  async getCatDetails(catId: string): Promise<Cat> {
    if (!catId) {
      throw new APIError({
        message: 'Cat ID is required',
        status: 400,
        code: 'INVALID_PARAMETER'
      });
    }
    return this.fetchWithCache<Cat>(`${this.baseUrl}/api/cats/${catId}`);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const catService = new CatService();
