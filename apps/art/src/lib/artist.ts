import { cache } from 'react';
import { notFound } from 'next/navigation';
import { siteArtist, ApiError, type PublicUserDto } from '@hatohui/models';
import '@/lib/api';

export const getSiteArtist = cache(async (): Promise<PublicUserDto> => {
  try {
    const response = await siteArtist();
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
});
