import type { Cat, Category } from '@/types';

export interface ICatService {
  getCategories: () => Promise<Category[]>;
  getCats: (
    page: number,
    limit: number,
    categoryIds?: string
  ) => Promise<Cat[]>;
  getCatDetails: (catId: string) => Promise<Cat>;
}
