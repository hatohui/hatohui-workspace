import { assets } from '@hatohui/models';
import '@/lib/api';
import { requireArtist } from '@/lib/session';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GALLERY_PAGE_SIZE } from '@/constants/gallery';

export default async function GalleryPage() {
  const user = await requireArtist();
  const response = await assets({
    page: 1,
    pageSize: GALLERY_PAGE_SIZE,
    uploadedById: user.id,
  });

  return (
    <GalleryGrid
      artistId={user.id}
      initialData={{ items: response.data.items, total: response.data.total }}
    />
  );
}
