import type { LearningGoalInput, LearningPlan, SkillOverview } from '../types/domain';
import type { ApiClient } from './client';
import { mockApiClient } from './mockClient';

const client: ApiClient = mockApiClient;

export const getSkillOverviews = async (): Promise<SkillOverview[]> =>
  client.get<SkillOverview[]>('/skills');

export const getLearningPlan = async (planId: string): Promise<LearningPlan> =>
  client.get<LearningPlan>(`/learning-plans/${planId}`);

export const createLearningPlan = async (
  input: LearningGoalInput,
): Promise<LearningPlan> => client.post<LearningGoalInput, LearningPlan>('/learning-plans/generate', input);
