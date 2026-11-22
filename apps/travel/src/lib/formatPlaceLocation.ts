import type { TravelPlaceSummaryDto } from '@hatohui/models';

export function formatPlaceLocation(place: TravelPlaceSummaryDto): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  for (const raw of [place.address, place.city, place.area?.name]) {
    const value = raw?.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(value);
  }
  return parts.join(', ');
}

export function hasPlaceCoordinates(place: TravelPlaceSummaryDto): boolean {
  return (
    Boolean(place.mapsUrl) ||
    (place.latitude != null && place.longitude != null)
  );
}
