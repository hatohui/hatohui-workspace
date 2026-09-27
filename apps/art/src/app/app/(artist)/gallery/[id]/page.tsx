import { ArtworkDetail } from '@/components/gallery/ArtworkDetail';
import { WORKSPACE_GALLERY_ROUTE } from '@/constants/gallery';
import { loadArtwork } from '@/lib/artwork';
import { requireArtist } from '@/lib/session';

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireArtist();
  const artwork = await loadArtwork(id, user.id);

  return (
    <ArtworkDetail
      asset={artwork}
      backHref={WORKSPACE_GALLERY_ROUTE}
      editable
    />
  );
}
