'use client';
import React, { useCallback, useEffect, useState } from 'react';
import type { Category } from '@/types';
import { Button } from './ui/button';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  initialSelected: string;
  className?: string;
}

export function CategoryFilter({
  categories,
  initialSelected,
  className
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string>(initialSelected);

  // Sync with URL params, very laggy
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam !== selected) {
      setSelected(categoryParam ?? '');
    }
  }, [searchParams, selected]);

  const toggleCategory = useCallback(
    (id: string) => {
      const newSelected = selected === id ? '' : id;
      setSelected(newSelected);

      const params = new URLSearchParams(searchParams.toString());
      if (newSelected) {
        params.set('category', newSelected);
      } else {
        params.delete('category');
      }

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    },
    [selected, pathname, router, searchParams]
  );

  return (
    <nav
      className={cn(
        'mb-6 space-x-4 overflow-x-auto flex items-center pb-2',
        className
      )}
      aria-label="Category filter"
    >
      <Button
        variant={!selected ? 'default' : 'outline'}
        className="px-6 rounded-full cursor-pointer uppercase text-xs whitespace-nowrap"
        onClick={() => toggleCategory('')}
        aria-pressed={!selected}
        aria-label="Show with breeds"
      >
        With Breeds
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selected === category.id.toString() ? 'default' : 'outline'}
          className="px-6 rounded-full cursor-pointer uppercase text-xs whitespace-nowrap"
          onClick={() => toggleCategory(category.id.toString())}
          aria-pressed={selected === category.id.toString()}
          aria-label={`Filter by ${category.name}`}
        >
          {category.name}
        </Button>
      ))}
    </nav>
  );
}
