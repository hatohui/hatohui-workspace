import { cookies } from 'next/headers';
import type { UserDto } from '@hatohui/models';
import { API_URL } from './api';

const SESSION_COOKIE_NAME = 'hatohui_session';

export async function getSessionUser(): Promise<UserDto | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;

  return (await response.json()) as UserDto;
}
