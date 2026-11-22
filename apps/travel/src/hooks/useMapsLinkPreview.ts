import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { travelMapsLinkPreview } from '@hatohui/models';
import { useDebouncedValue } from '@hatohui/libs';
import {
  MAPS_LINK_DEBOUNCE_MS,
  MAPS_LINK_PATTERN,
  MAPS_LINK_PREVIEW_KEY,
} from '../constants/maps';
import type { MapTarget } from '../lib/mapsEmbedUrl';

export function useMapsLinkPreview(url: string, fallbackName: string) {
  const [appliedForUrl, setAppliedForUrl] = useState<string | null>(null);
  const trimmedUrl = url.trim();
  const debounced = useDebouncedValue(trimmedUrl, MAPS_LINK_DEBOUNCE_MS);
  const name = useDebouncedValue(fallbackName.trim(), MAPS_LINK_DEBOUNCE_MS);
  const isLink = MAPS_LINK_PATTERN.test(debounced);

  const preview = useQuery({
    queryKey: [MAPS_LINK_PREVIEW_KEY, debounced],
    queryFn: async () => (await travelMapsLinkPreview({ url: debounced })).data,
    enabled: isLink,
    staleTime: Infinity,
  });

  const data = isLink ? preview.data : undefined;
  const hasLocation = data?.latitude != null && data?.longitude != null;
  const target: MapTarget | null = hasLocation
    ? { latitude: data.latitude, longitude: data.longitude }
    : data?.name || name
      ? { name: data?.name || name }
      : null;
  const linkName = data?.name ?? null;
  const suggestedName =
    linkName && linkName !== fallbackName.trim() && appliedForUrl !== trimmedUrl
      ? linkName
      : null;

  return {
    target,
    linkName,
    suggestedName,
    isLoading: isLink && preview.isFetching,
    notFound: isLink && Boolean(data) && !hasLocation && !data?.name,
    markNameApplied: () => setAppliedForUrl(trimmedUrl),
    clearAppliedName: () => setAppliedForUrl(null),
  };
}
