export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapsLocation {
  mapsUrl: string;
  coordinates: Coordinates | null;
  name: string | null;
}

const PATTERNS = [
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
];

const PLACE_NAME_PATTERN = /\/maps\/place\/([^/@?]+)/;
const SHORT_LINK_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl']);
const GOOGLE_HOST = /^(?:www\.|maps\.)?google\.[a-z]{2,3}(?:\.[a-z]{2})?$/;
const MAX_REDIRECTS = 5;
const RESOLVE_TIMEOUT_MS = 5000;

function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

export function coordinatesFromMapsUrl(url: string): Coordinates | null {
  const decoded = decode(url);
  for (const pattern of PATTERNS) {
    const match = decoded.match(pattern);
    if (!match) continue;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
      return { latitude, longitude };
    }
  }
  return null;
}

export function placeNameFromMapsUrl(url: string): string | null {
  const match = url.match(PLACE_NAME_PATTERN);
  return match ? decode(match[1]).trim() || null : null;
}

function hostOf(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.hostname : null;
  } catch {
    return null;
  }
}

async function expandShortLink(url: string): Promise<string> {
  let current = url;
  for (let hop = 0; hop < MAX_REDIRECTS; hop += 1) {
    const host = hostOf(current);
    if (!host || !SHORT_LINK_HOSTS.has(host)) return current;

    const response = await fetch(current, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(RESOLVE_TIMEOUT_MS),
    });
    const location = response.headers.get('location');
    if (!location) return current;

    const next = new URL(location, current).toString();
    const nextHost = hostOf(next);
    if (!nextHost) return current;
    if (!SHORT_LINK_HOSTS.has(nextHost) && !GOOGLE_HOST.test(nextHost)) {
      return current;
    }
    current = next;
  }
  return current;
}

export async function resolveMapsLocation(url: string): Promise<MapsLocation> {
  const expanded = coordinatesFromMapsUrl(url)
    ? url
    : await expandShortLink(url).catch(() => url);
  return {
    mapsUrl: url,
    coordinates: coordinatesFromMapsUrl(expanded),
    name: placeNameFromMapsUrl(expanded),
  };
}
