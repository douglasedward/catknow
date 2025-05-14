import { Suspense } from 'react';
import { Metadata } from 'next';
import { CategoryFilter } from '@/components/CategoryFilter';
import InfiniteScroll from '@/components/InfiniteScroll';
import { catService } from '@/services/CatService';
import { APIError } from '@/lib/api-utils';

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const INITIAL_PAGE = 0;
const DEFAULT_LIMIT = 12;

export const metadata: Metadata = {
  title: 'CatKnow - Discover Cat Breeds',
  description:
    'Explore various cat breeds and learn more about their characteristics'
};

async function fetchInitialData(selectedCategory: string) {
  try {
    const [categories, initialCats] = await Promise.all([
      catService.getCategories(),
      catService.getCats(INITIAL_PAGE, DEFAULT_LIMIT, selectedCategory)
    ]);
    return { categories, initialCats };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    if (error instanceof APIError) {
      throw error;
    }
    return {
      categories: [],
      initialCats: []
    };
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const { category } = await searchParams;
  const selectedCategory: string = (category as string) ?? '';

  const { categories, initialCats } = await fetchInitialData(selectedCategory);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Suspense
          fallback={
            <div className="h-12 bg-gray-100 animate-pulse rounded-full mb-6" />
          }
        >
          <CategoryFilter
            categories={categories}
            initialSelected={selectedCategory}
            className="sticky top-0 z-10 bg-white/80 backdrop-blur-md pt-4"
          />
        </Suspense>

        <Suspense
          fallback={
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-gray-100 animate-pulse rounded-xl"
                />
              ))}
            </div>
          }
        >
          <InfiniteScroll
            initialItems={initialCats}
            initialPage={INITIAL_PAGE}
            limit={DEFAULT_LIMIT}
            filters={selectedCategory}
          />
        </Suspense>

        {initialCats.length === 0 && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <p className="text-lg font-semibold">Unable to load content</p>
            <p className="mt-2">Please try refreshing the page</p>
          </div>
        )}
      </div>
    </main>
  );
}
