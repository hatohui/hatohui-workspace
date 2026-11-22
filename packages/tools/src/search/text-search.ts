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

export function findHighlightRanges(
  text: string,
  query: string,
): Array<[number, number]> {
  const phrase = foldText(query);
  if (!phrase) return [];

  let folded = '';
  const spans: Array<[number, number]> = [];
  let offset = 0;

  for (const ch of text) {
    const start = offset;
    const end = offset + ch.length;
    offset = end;

    const piece = ch
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/\s+/g, ' ');

    if (!piece) {
      if (spans.length > 0) spans[spans.length - 1][1] = end;
      continue;
    }

    for (const mapped of piece) {
      if (mapped === ' ' && folded.endsWith(' ')) continue;
      folded += mapped;
      spans.push([start, end]);
    }
  }

  const exactAt = folded.indexOf(phrase);
  if (exactAt >= 0) {
    return [[spans[exactAt][0], spans[exactAt + phrase.length - 1][1]]];
  }

  const raw: Array<[number, number]> = [];
  for (const token of searchTokens(query)) {
    const at = folded.indexOf(token);
    if (at >= 0) {
      raw.push([spans[at][0], spans[at + token.length - 1][1]]);
    }
  }
  raw.sort((a, b) => a[0] - b[0]);

  const merged: Array<[number, number]> = [];
  for (const [start, end] of raw) {
    const prev = merged[merged.length - 1];
    if (prev && start <= prev[1]) {
      prev[1] = Math.max(prev[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}
