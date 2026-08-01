import { assets } from '@hatohui/models';
import '@/lib/api';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GALLERY_PAGE_SIZE } from '@/constants/gallery';

// The gallery must reflect live uploads, and the CI build has no reachable
// API to prerender against anyway — always render this route per-request.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const response = await assets({ page: 1, pageSize: GALLERY_PAGE_SIZE });

  return (
    <GalleryGrid
      initialData={{
        items: response.data.items,
        total: response.data.total,
      }}
    />
  );
}
