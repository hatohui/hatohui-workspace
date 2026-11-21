import { MAPS_EMBED_URL, MAPS_EMBED_ZOOM } from '../constants/maps';

export interface MapTarget {
  latitude?: number | null;
  longitude?: number | null;
  name?: string | null;
  address?: string | null;
}

function queryOf(target: MapTarget): string | null {
  if (target.latitude != null && target.longitude != null) {
    return `${target.latitude},${target.longitude}`;
  }
  const label = [target.name, target.address].filter(Boolean).join(', ');
  return label || null;
}

export function mapsEmbedUrl(target: MapTarget): string | null {
  const query = queryOf(target);
  if (!query) return null;
  const params = new URLSearchParams({
    q: query,
    z: String(MAPS_EMBED_ZOOM),
    output: 'embed',
  });
  return `${MAPS_EMBED_URL}?${params.toString()}`;
}
