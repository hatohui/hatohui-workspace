export function foldText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchTokens(query: string): string[] {
  const folded = foldText(query);
  return folded ? folded.split(' ') : [];
}

export function matchesSearch(
  query: string,
  fields: ReadonlyArray<string | null | undefined>,
): boolean {
  const tokens = searchTokens(query);
  if (!tokens.length) return true;
  const haystack = fields
    .map((field) => (field ? foldText(field) : ''))
    .filter(Boolean)
    .join(' ');
  return tokens.every((token) => haystack.includes(token));
}

export function searchMatchRank(query: string, primary: string): number {
  const q = foldText(query);
  if (!q) return 0;
  const target = foldText(primary);
  if (target === q) return 0;
  if (target.startsWith(q)) return 1;
  if (target.includes(q)) return 2;
  if (searchTokens(query).every((token) => target.includes(token))) return 3;
  return 4;
}
