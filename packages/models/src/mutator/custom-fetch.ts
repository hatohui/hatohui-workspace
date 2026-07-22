let baseUrl: string | undefined;

export function setApiBaseUrl(url: string) {
  baseUrl = url;
}

function getBaseUrl(): string {
  if (!baseUrl) {
    throw new Error(
      'API base URL is not configured. Call setApiBaseUrl() before making requests.',
    );
  }
  return baseUrl;
}

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const response = await fetch(`${getBaseUrl()}${url}`, options);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = response.status === 204 ? undefined : await response.json();

  return { data, status: response.status, headers: response.headers } as T;
};

export default customFetch;
