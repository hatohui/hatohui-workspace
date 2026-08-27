import type { ReactNode } from 'react';
import { resolveArtist } from '@/lib/artist';

export default async function ArtistLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ artist: string }>;
}) {
  const { artist } = await params;
  await resolveArtist(artist); // notFound() if the handle isn't a real artist

  return children;
}
