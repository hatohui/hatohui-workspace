'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { assets, getAssetsQueryKey, type AssetDto } from '@hatohui/models';
import { useDebouncedValue } from '@hatohui/libs';
import {
  GALLERY_EAGER_PAGES,
  GALLERY_PAGE_SIZE,
  GALLERY_SEARCH_DEBOUNCE_MS,
} from '@/constants/gallery';

export interface GalleryInitialData {
  items: AssetDto[];
  total: number;
}

export function useGalleryAssets(
  artistId: string | undefined,
  initialData?: GalleryInitialData,
) {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [hidePrivate, setHidePrivate] = useState(false);

  const debouncedQuery = useDebouncedValue(query, GALLERY_SEARCH_DEBOUNCE_MS);
  const isDefaultFilters =
    debouncedQuery === '' && tags.length === 0 && !hidePrivate;
  const params = {
    query: debouncedQuery || undefined,
    tags: tags.length > 0 ? tags : undefined,
    uploadedById: artistId,
    hidePrivate: hidePrivate || undefined,
    pageSize: GALLERY_PAGE_SIZE,
  };

  const assetsQuery = useInfiniteQuery({
    queryKey: [...getAssetsQueryKey(params), 'infinite'],
    queryFn: ({ pageParam }) => assets({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.data.hasMore ? last.data.page + 1 : undefined,
    initialData:
      isDefaultFilters && initialData
        ? {
            pageParams: [1],
            pages: [
              {
                data: {
                  items: initialData.items,
                  total: initialData.total,
                  page: 1,
                  pageSize: GALLERY_PAGE_SIZE,
                  hasMore: initialData.total > GALLERY_PAGE_SIZE,
                },
                status: 200 as const,
                headers: new Headers(),
              },
            ],
          }
        : undefined,
  });

  const loadedPages = assetsQuery.data?.pages.length ?? 0;
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = assetsQuery;

  useEffect(() => {
    if (
      loadedPages > 0 &&
      loadedPages < GALLERY_EAGER_PAGES &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [loadedPages, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = useMemo(
    () => assetsQuery.data?.pages.flatMap((page) => page.data.items) ?? [],
    [assetsQuery.data],
  );

  const itemsKey = useMemo(
    () => items.map((asset) => asset.id).join(','),
    [items],
  );

  return {
    items,
    itemsKey,
    total: assetsQuery.data?.pages[0]?.data.total ?? 0,
    hasMore: assetsQuery.hasNextPage,
    isLoading: assetsQuery.isPending,
    isFetchingMore: assetsQuery.isFetchingNextPage,
    loadMore: () => void assetsQuery.fetchNextPage(),
    artistId,
    query,
    setQuery,
    tags,
    addTag: (name: string) =>
      setTags((current) =>
        current.includes(name) ? current : [...current, name],
      ),
    removeTag: (name: string) =>
      setTags((current) => current.filter((tag) => tag !== name)),
    removeLastTag: () => setTags((current) => current.slice(0, -1)),
    hidePrivate,
    setHidePrivate,
  };
}
