import { artists } from '@hatohui/models';
import '@/lib/api';
import { ArtistPicker } from '@/components/layout/ArtistPicker';

export const dynamic = 'force-dynamic';

export default async function ArtistIndexPage() {
  const response = await artists();

  return <ArtistPicker artists={response.data} />;
}
