const SHOW_PAGES = 5;

export function getPageNumbers(
  page: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  if (totalPages <= SHOW_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | 'ellipsis'> = [1];
  if (page > 3) pages.push('ellipsis');

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) pages.push(i);
  }

  if (page < totalPages - 2) pages.push('ellipsis');
  if (!pages.includes(totalPages)) pages.push(totalPages);
  return pages;
}
