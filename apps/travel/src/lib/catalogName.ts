export const normalizeCatalogName = (value: string) =>
  value.trim().toLowerCase().replace(/[‘’]/g, "'");

export const sameCatalogName = (a: string, b: string) =>
  normalizeCatalogName(a) === normalizeCatalogName(b);
