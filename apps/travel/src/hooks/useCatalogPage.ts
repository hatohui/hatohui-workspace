import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CATALOG_PAGE_PARAM } from '../constants/food';

const withPage = (prev: URLSearchParams, page: number) => {
  const updated = new URLSearchParams(prev);
  if (page > 1) updated.set(CATALOG_PAGE_PARAM, String(page));
  else updated.delete(CATALOG_PAGE_PARAM);
  return updated;
};

export function useCatalogPage(resetKey: string) {
  const [params, setParams] = useSearchParams();
  const [key, setKey] = useState(resetKey);
  const isStale = key !== resetKey;
  const raw = Number(params.get(CATALOG_PAGE_PARAM));
  const urlPage = Number.isInteger(raw) && raw > 1 ? raw : 1;

  useEffect(() => {
    if (!isStale) return;
    if (urlPage > 1) setParams((prev) => withPage(prev, 1), { replace: true });
    else setKey(resetKey);
  }, [isStale, urlPage, resetKey, setParams]);

  const setPage = (next: number) =>
    setParams((prev) => withPage(prev, next), { replace: true });

  return { page: isStale ? 1 : urlPage, setPage };
}
