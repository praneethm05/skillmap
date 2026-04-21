import type { LearningPlan, ProgressSummary } from '../types/domain';
import type { ApiClient } from './client';
import { mockApiClient } from './mockClient';

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
  const completedHours = plan.subtopics
    .filter((subtopic) => subtopic.isCompleted)
    .reduce((total, subtopic) => total + subtopic.estimatedHours, 0);
  const completionPercentage =
    plan.totalTopics > 0 ? Math.round((plan.completedTopics / plan.totalTopics) * 100) : 0;

  return {
    totalTopics: plan.totalTopics,
    completedTopics: plan.completedTopics,
    completionPercentage,
    completedHours,
    estimatedTotalHours: plan.estimatedTotalHours,
  };
};
