'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TAB_SEARCH_PARAM } from '@/constants/navigation';

/// Active tab stored in the URL query.
export function useTabParam<T extends string>(tabs: readonly T[], fallback: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get(TAB_SEARCH_PARAM);
  const tab = tabs.find((name) => name === current) ?? fallback;

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === fallback) params.delete(TAB_SEARCH_PARAM);
    else params.set(TAB_SEARCH_PARAM, next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return { tab, setTab };
}
