export function uniqueNames(names: string[]): string[] {
  const byKey = new Map<string, string>();
  for (const raw of names) {
    const name = raw.trim();
    const key = name.toLowerCase();
    if (name && !byKey.has(key)) byKey.set(key, name);
  }
  return [...byKey.values()];
}
