import { assets } from '@hatohui/models';
import '@/lib/api';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import {
  GALLERY_PAGE_SIZE,
  GALLERY_PROJECTS_SECTION,
  GALLERY_SECTION_PARAM,
} from '@/constants/gallery';
import { resolveArtist } from '@/lib/artist';
import { withSession } from '@/lib/session';

// The gallery must reflect live uploads, and the CI build has no reachable
// API to prerender against anyway - always render this route per-request.
export const dynamic = 'force-dynamic';

export default async function ArtistGalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ artist: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { artist } = await params;
  const section = (await searchParams)[GALLERY_SECTION_PARAM];
  const artistUser = await resolveArtist(artist);
  const response = await assets(
    { page: 1, pageSize: GALLERY_PAGE_SIZE, uploadedById: artistUser.id },
    await withSession(),
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <GalleryGrid
        artistId={artistUser.id}
        galleryBasePath={`/${artist}/gallery`}
        projectBasePath={`/${artist}/projects`}
        initialSection={
          section === GALLERY_PROJECTS_SECTION ? 'projects' : 'assets'
        }
        initialData={{
          items: response.data.items,
          total: response.data.total,
        }}
      />
    </main>
  );
}
