import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { catService } from '@/services/CatService';
import { APIError } from '@/lib/api-utils';
import { ImageWithLoading } from '@/components/ui/image';

interface CatDetailPageProps {
  params: { id: string };
}

async function getCatData(id: string) {
  try {
    const cat = await catService.getCatDetails(id);
    if (!cat) return null;
    return { cat, breed: cat.breeds?.[0] };
  } catch (error) {
    if (error instanceof APIError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function generateMetadata({
  params
}: CatDetailPageProps): Promise<Metadata> {
  const data = await getCatData(params.id);

  if (!data) {
    return {
      title: 'Cat Not Found - CatKnow',
      description: 'The requested cat could not be found'
    };
  }

  const { breed } = data;

  return {
    title: breed?.name ? `${breed.name} - CatKnow` : 'Cat Details - CatKnow',
    description: breed?.description || 'Learn more about this beautiful cat'
  };
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export default async function CatPage({ params }: CatDetailPageProps) {
  const data = await getCatData(params.id);

  if (!data) {
    notFound();
  }

  const { cat, breed } = data;

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6">
      <nav className="mb-6" aria-label="Back to cats">
        <Link
          href="/"
          className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />
          Back to all cats
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
          <ImageWithLoading
            src={cat.url}
            alt={breed?.name || 'Cat'}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
            fallbackText="Unable to load cat image"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {breed?.name || 'Beautiful Cat'}
            </h1>
            {breed?.description && (
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                {breed.description}
              </p>
            )}
          </div>

          {breed && (
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {breed.origin && <Stat label="Origin" value={breed.origin} />}
              {breed.temperament && (
                <Stat label="Temperament" value={breed.temperament} />
              )}
              {breed.life_span && (
                <Stat label="Life Span" value={breed.life_span} />
              )}
              {breed.weight?.metric && (
                <Stat label="Weight" value={`${breed.weight.metric} kg`} />
              )}
              {breed.adaptability && (
                <Stat label="Adaptability" value={`${breed.adaptability}/5`} />
              )}
              {breed.affection_level && (
                <Stat
                  label="Affection Level"
                  value={`${breed.affection_level}/5`}
                />
              )}
              {breed.energy_level && (
                <Stat label="Energy Level" value={`${breed.energy_level}/5`} />
              )}
              {breed.intelligence && (
                <Stat label="Intelligence" value={`${breed.intelligence}/5`} />
              )}
              {breed.child_friendly && (
                <Stat
                  label="Child Friendly"
                  value={`${breed.child_friendly}/5`}
                />
              )}
            </dl>
          )}

          {breed?.wikipedia_url && (
            <div className="pt-4">
              <a
                href={breed.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center"
              >
                Learn more on Wikipedia
                <span className="sr-only"> about {breed.name}</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
