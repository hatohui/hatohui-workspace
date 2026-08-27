'use client';

import { useState } from 'react';
import { useAssets, type AssetDto, type AssetsSort } from '@hatohui/models';
import { useDebouncedValue } from '@hatohui/libs';
import { GALLERY_PAGE_SIZE } from '@/constants/gallery';

export interface GalleryInitialData {
  items: AssetDto[];
  total: number;
}

export function useGalleryAssets(
  artistId: string | undefined,
  initialData?: GalleryInitialData,
) {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<AssetsSort>('newest');
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebouncedValue(query, 300);
  const isDefaultFilters =
    debouncedQuery === '' &&
    tag === undefined &&
    sort === 'newest' &&
    page === 1;

  const assetsQuery = useAssets(
    {
      query: debouncedQuery || undefined,
      tag,
      uploadedById: artistId,
      sort,
      page,
      pageSize: GALLERY_PAGE_SIZE,
    },
    {
      query: {
        initialData:
          isDefaultFilters && initialData
            ? {
                data: {
                  items: initialData.items,
                  total: initialData.total,
                  page: 1,
                  pageSize: GALLERY_PAGE_SIZE,
                  hasMore: initialData.total > GALLERY_PAGE_SIZE,
                },
                status: 200 as const,
                headers: new Headers(),
              }
            : undefined,
      },
    },
  );

  return {
    items: assetsQuery.data?.data.items ?? [],
    total: assetsQuery.data?.data.total ?? 0,
    hasMore: assetsQuery.data?.data.hasMore ?? false,
    isLoading: assetsQuery.isPending,
    query,
    setQuery: (value: string) => {
      setQuery(value);
      setPage(1);
    },
    tag,
    setTag: (value: string | undefined) => {
      setTag(value);
      setPage(1);
    },
    sort,
    setSort: (value: AssetsSort) => {
      setSort(value);
      setPage(1);
    },
    page,
    setPage,
  };
}
