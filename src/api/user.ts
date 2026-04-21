import type { UserProfile } from '../types/domain';
import type { ApiClient } from './client';
import { mockApiClient } from './mockClient';

const client: ApiClient = mockApiClient;

export const getCurrentUser = async (): Promise<UserProfile> =>
  client.get<UserProfile>('/users/me');
