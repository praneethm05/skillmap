import type { LearningPlan } from '../types/domain';
import { withRecalculatedProgress } from '../utils/progress';
import { apiClient } from './index';

export const saveJourneyEdits = async (plan: LearningPlan): Promise<LearningPlan> => {
  const shouldFail = plan.subtopics.some((subtopic) => subtopic.title.toLowerCase().includes('[fail]'));
  if (shouldFail) {
    throw new Error('Could not save journey edits. Remove [fail] and retry.');
  }

  const response = await apiClient.put<Partial<LearningPlan>, LearningPlan>(`/learning-plans/${plan.id}`, plan);
  return withRecalculatedProgress(response);
};
