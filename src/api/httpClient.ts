import type { ApiClient, ApiRequestOptions } from './client';
import type { ApiError } from '../types/api';

type AuthTokenProvider = () => Promise<string | null>;

interface ClerkWindow extends Window {
  Clerk?: {
    session?: {
      getToken: () => Promise<string | null>;
    };
  };
}

let authTokenProvider: AuthTokenProvider | null = null;

export const setAuthTokenProvider = (provider: AuthTokenProvider | null): void => {
  authTokenProvider = provider;
};

const createApiError = async (response: Response): Promise<Error> => {
  let parsedError: Partial<ApiError> | undefined;

  try {
    parsedError = (await response.json()) as Partial<ApiError>;
  } catch {
    parsedError = undefined;
  }

  const message = parsedError?.message ?? `Request failed with status ${response.status}`;
  return new Error(message);
};

const getAuthHeaders = async (): Promise<HeadersInit> => {
  try {
    const clerkWindow = window as ClerkWindow;
    const token = authTokenProvider
      ? await authTokenProvider()
      : await clerkWindow.Clerk?.session?.getToken();

    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch (e) {
    console.warn('Failed to retrieve Clerk token:', e);
  }
  return {};
};

const request = async <TResponse>(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<TResponse> => {
  const authHeaders = await getAuthHeaders();
  
  const response = await fetch(input, {
    ...init,
    headers: {
      ...authHeaders,
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return (await response.json()) as TResponse;
};

export const createHttpApiClient = (baseUrl: string): ApiClient => {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  const withBaseUrl = (path: string): string => `${normalizedBaseUrl}${path}`;

  return {
    get: <TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse> =>
      request<TResponse>(withBaseUrl(path), {
        method: 'GET',
        signal: options?.signal,
      }),

    post: <TBody, TResponse>(
      path: string,
      body: TBody,
      options?: ApiRequestOptions,
    ): Promise<TResponse> =>
      request<TResponse>(withBaseUrl(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: options?.signal,
      }),

    patch: <TBody, TResponse>(
      path: string,
      body: TBody,
      options?: ApiRequestOptions,
    ): Promise<TResponse> =>
      request<TResponse>(withBaseUrl(path), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: options?.signal,
      }),
  };
};
