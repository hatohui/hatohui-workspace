export function rangesOverlap(
  aFrom: Date,
  aTo: Date,
  bFrom: Date,
  bTo: Date,
): boolean {
  return aFrom < bTo && aTo > bFrom;
}
