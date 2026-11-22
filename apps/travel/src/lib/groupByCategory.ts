export interface CategoryGroup<T> {
  key: string;
  label: string;
  items: T[];
  isUncategorized: boolean;
}

export function groupByCategory<T>(
  items: T[],
  getCategories: (item: T) => string[],
  activeCategories: string[],
  uncategorizedLabel: string,
): CategoryGroup<T>[] {
  const activeSet = activeCategories.length
    ? new Set(activeCategories.map((c) => c.toLowerCase()))
    : null;
  const buckets = new Map<string, CategoryGroup<T>>();
  const uncategorized: T[] = [];

  for (const item of items) {
    const raw = getCategories(item);
    const matching = activeSet
      ? raw.filter((c) => activeSet.has(c.toLowerCase()))
      : raw;

    if (!matching.length) {
      if (!activeSet) uncategorized.push(item);
      continue;
    }

    for (const category of matching) {
      const key = category.toLowerCase();
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.items.push(item);
      } else {
        buckets.set(key, {
          key,
          label: category,
          items: [item],
          isUncategorized: false,
        });
      }
    }
  }

  const groups = [...buckets.values()].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  if (uncategorized.length) {
    groups.push({
      key: '__uncategorized__',
      label: uncategorizedLabel,
      items: uncategorized,
      isUncategorized: true,
    });
  }
  return groups;
}
