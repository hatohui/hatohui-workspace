export function slugify(label: string): string {
  const base = label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return base || 'ITEM';
}

export async function uniqueSlug(
  label: string,
  exists: (key: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(label);
  let candidate = base;
  let suffix = 2;
  while (await exists(candidate)) {
    candidate = `${base}_${suffix}`;
    suffix += 1;
  }
  return candidate;
}
