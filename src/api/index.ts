import type { ApiClient } from './client';
import { appEnv } from '../config/env';
import { featureFlags } from '../config/featureFlags';
import { createHttpApiClient } from './httpClient';
import { mockApiClient } from './mockClient';

const resolvedClient: ApiClient = featureFlags.useMockApi
  ? mockApiClient
  : createHttpApiClient(appEnv.apiBaseUrl);

export const apiClient = resolvedClient;
