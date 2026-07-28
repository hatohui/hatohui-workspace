let baseUrl: string | undefined;

export function setApiBaseUrl(url: string) {
  baseUrl = url;
}

export function getApiBaseUrl(): string {
  return getBaseUrl();
}

function getBaseUrl(): string {
  if (!baseUrl) {
    throw new Error(
      'API base URL is not configured. Call setApiBaseUrl() before making requests.',
    );
  }
  return baseUrl;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`Request failed: ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const response = await fetch(`${getBaseUrl()}${url}`, {
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  const data = response.status === 204 ? undefined : await response.json();

  return { data, status: response.status, headers: response.headers } as T;
};

export default customFetch;
