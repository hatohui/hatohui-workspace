import type { TravelCatalogSort } from '@/modules/travel-recommendations/travel-recommendations.constants';

interface Sortable {
  id: string;
  name: string;
  createdAt: Date;
}

const newestFirst = (a: Sortable, b: Sortable) =>
  b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id);

export function sortTravelCatalog<T extends Sortable>(
  items: T[],
  sort: TravelCatalogSort | undefined,
  popularity: (item: T) => number,
): T[] {
  switch (sort) {
    case 'newest':
      return [...items].sort(newestFirst);
    case 'oldest':
      return [...items].sort((a, b) => newestFirst(b, a));
    case 'name':
      return [...items].sort(
        (a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) ||
          newestFirst(a, b),
      );
    case 'popular':
      return [...items].sort(
        (a, b) => popularity(b) - popularity(a) || newestFirst(a, b),
      );
    default:
      return items;
  }
}
