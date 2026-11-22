import {
  resolveMapsLocation,
  type MapsLocation,
} from '@/common/utils/maps-coordinates';
import type { TravelPlaceInputDto } from '@/modules/travel-recommendations/dto/travel-place-input.dto';

const optional = (value: string | undefined) =>
  value === undefined ? undefined : value.trim() || null;

function coordinate(
  location: MapsLocation | null | undefined,
  axis: 'latitude' | 'longitude',
): number | null | undefined {
  if (location === undefined) return undefined;
  return location?.coordinates?.[axis] ?? null;
}

export async function travelPlaceData(dto: Partial<TravelPlaceInputDto>) {
  const mapsUrl = optional(dto.mapsUrl);
  const hasCoordinates =
    dto.latitude !== undefined && dto.longitude !== undefined;
  const location =
    hasCoordinates || mapsUrl === undefined
      ? undefined
      : mapsUrl
        ? await resolveMapsLocation(mapsUrl)
        : null;

  return {
    name: dto.name?.trim(),
    areaId: optional(dto.areaId),
    address: optional(dto.address),
    note: optional(dto.note),
    mapsUrl,
    latitude: hasCoordinates ? dto.latitude : coordinate(location, 'latitude'),
    longitude: hasCoordinates
      ? dto.longitude
      : coordinate(location, 'longitude'),
  };
}
