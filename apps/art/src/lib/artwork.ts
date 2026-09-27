import { notFound } from 'next/navigation';
import { asset, ApiError, type AssetDto } from '@hatohui/models';
import '@/lib/api';

export async function loadArtwork(
  id: string,
  ownerId: string,
): Promise<AssetDto> {
  const response = await asset(id).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  if (response.data.uploadedById !== ownerId) notFound();
  return response.data;
}
