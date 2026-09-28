import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ArtistSetupDto, UserDto } from '@hatohui/models';
import { API_URL } from './api';

const SESSION_COOKIE_NAME = 'hatohui_session';

async function sessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function withSession(): Promise<RequestInit> {
  const token = await sessionToken();
  return token
    ? {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${token}` },
        cache: 'no-store',
      }
    : { cache: 'no-store' };
}

async function fetchWithSession<T>(path: string): Promise<T | null> {
  const token = await sessionToken();
  if (!token) return null;

  const response = await fetch(`${API_URL}${path}`, {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;

  return (await response.json()) as T;
}

export function getSessionUser(): Promise<UserDto | null> {
  return fetchWithSession<UserDto>('/auth/me');
}

export function getArtistSetup(): Promise<ArtistSetupDto | null> {
  return fetchWithSession<ArtistSetupDto>('/artist-setup');
}

export async function requireArtist(): Promise<UserDto> {
  const user = await getSessionUser();
  if (!user?.isArtist) redirect('/app');
  return user;
}
