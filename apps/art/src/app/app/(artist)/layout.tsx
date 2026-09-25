import type { ReactNode } from 'react';
import { requireArtist } from '@/lib/session';

export default async function ArtistLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireArtist();
  return children;
}
