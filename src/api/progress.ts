import type { LearningPlan, ProgressSummary } from '../types/domain';
import type { ApiClient } from './client';
import { mockApiClient } from './mockClient';
import { calculateProgressSummary } from '../utils/progress';

const client: ApiClient = mockApiClient;

interface ToggleSubtopicPayload {
  isCompleted: boolean;
}

export const toggleSubtopicCompletion = async (
  planId: string,
  subtopicId: string,
  isCompleted: boolean,
): Promise<LearningPlan> =>
  client.patch<ToggleSubtopicPayload, LearningPlan>(
    `/learning-plans/${planId}/subtopics/${subtopicId}/toggle`,
    { isCompleted },
  );

export const getProgressSummary = (plan: LearningPlan): ProgressSummary => {
  return calculateProgressSummary(plan);
};
