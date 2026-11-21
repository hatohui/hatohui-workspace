export interface Coordinates {
  latitude: number;
  longitude: number;
}

const PATTERNS = [
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
];

export function coordinatesFromMapsUrl(url: string): Coordinates | null {
  const decoded = decodeURIComponent(url);
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
