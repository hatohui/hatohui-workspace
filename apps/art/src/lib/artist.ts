import { cache } from 'react';
import { notFound } from 'next/navigation';
import { artistByHandle, ApiError, type PublicUserDto } from '@hatohui/models';
import '@/lib/api';

/** Resolves the `[artist]` route segment (a public handle) to the artist it
 * names. `cache()` de-dupes this within a single request, so the layout and
 * the page under it both calling this only hits the API once. 404s (unknown
 * handle, or a handle belonging to someone who isn't an artist) become
 * Next's notFound() rather than a thrown error. */
export const resolveArtist = cache(
  async (handle: string): Promise<PublicUserDto> => {
    try {
      const response = await artistByHandle(handle);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }
      throw error;
    }
  },
);
