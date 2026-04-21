import type { UserProfile } from '../types/domain';
import type { ApiClient } from './client';
import { apiClient } from './index';

const client: ApiClient = apiClient;

export const getCurrentUser = async (): Promise<UserProfile> =>
  client.get<UserProfile>('/users/me');
