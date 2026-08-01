'use client';

import { useAssets } from '@hatohui/models';

const EXAMPLES_PAGE_SIZE = 6;

export function useCommissionReferenceExamples(tag: string | undefined) {
  const query = useAssets(
    {
      tag: tag?.toLowerCase(),
      sort: 'newest',
      page: 1,
      pageSize: EXAMPLES_PAGE_SIZE,
    },
    { query: { enabled: !!tag } },
  );

  return {
    items: query.data?.data.items ?? [],
    isLoading: query.isPending && !!tag,
  };
}
