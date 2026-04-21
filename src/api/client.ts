export interface ApiRequestOptions {
  signal?: AbortSignal;
}

export interface ApiClient {
  get<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse>;
  post<TBody, TResponse>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse>;
  patch<TBody, TResponse>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse>;
}
