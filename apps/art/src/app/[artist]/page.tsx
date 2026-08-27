import { assets } from '@hatohui/models';
import '@/lib/api';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GALLERY_PAGE_SIZE } from '@/constants/gallery';
import { resolveArtist } from '@/lib/artist';

// The gallery must reflect live uploads, and the CI build has no reachable
// API to prerender against anyway — always render this route per-request.
export const dynamic = 'force-dynamic';

export default async function ArtistGalleryPage({
  params,
}: {
  params: Promise<{ artist: string }>;
}) {
  const { artist } = await params;
  const artistUser = await resolveArtist(artist);
  const response = await assets({
    page: 1,
    pageSize: GALLERY_PAGE_SIZE,
    uploadedById: artistUser.id,
  });

  return (
    <GalleryGrid
      artistId={artistUser.id}
      initialData={{
        items: response.data.items,
        total: response.data.total,
      }}
    />
  );
}
