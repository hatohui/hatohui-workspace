import { getApiBaseUrl } from '@hatohui/models';
import type { AuthUser } from './types';

async function request(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
}

export async function loginWithGoogle(idToken: string): Promise<AuthUser> {
  const response = await request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    throw new Error(`Google login failed: ${response.status}`);
  }
  return (await response.json()) as AuthUser;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await request('/auth/me');
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to load session: ${response.status}`);
  }
  return (await response.json()) as AuthUser;
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}
