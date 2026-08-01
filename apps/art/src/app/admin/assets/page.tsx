import { assets } from '@hatohui/models';
import '@/lib/api';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GALLERY_PAGE_SIZE } from '@/constants/gallery';

export default async function AdminAssetsPage() {
  const response = await assets({ page: 1, pageSize: GALLERY_PAGE_SIZE });

  return (
    <GalleryGrid
      initialData={{ items: response.data.items, total: response.data.total }}
    />
  );
}
