import type { LearningGoalInput, LearningPlan, SkillOverview, SkillSubtopic, SkillStatus } from '../types/domain';
import type { ApiClient } from './client';
import { apiClient } from './index';

const client: ApiClient = apiClient;

export const getSkillOverviews = async (): Promise<SkillOverview[]> => {
  const plans = await client.get<LearningPlan[]>('/learning-plans');
  return plans.map((plan: any) => ({
    id: plan.id,
    name: plan.courseName,
    subtopics: plan.subtopics.map((t: any) => ({
      id: t.id,
      name: t.title,
      status: (t.isCompleted ? 'completed' : 'not-started') as SkillStatus
    }))
  }));
};

export const getLearningPlan = async (planId: string): Promise<LearningPlan> =>
  client.get<LearningPlan>(`/learning-plans/${planId}`);

export const createLearningPlan = async (
  input: LearningGoalInput,
): Promise<LearningPlan> => client.post<LearningGoalInput, LearningPlan>('/learning-plans/generate', input);

export const markSkillComplete = async (skillId: string): Promise<SkillOverview> => {
  // Not used correctly for the UI which marks individual topics complete, but let's stub it out
  const empty: SkillOverview = { id: skillId, name: '', subtopics: [] };
  return Promise.resolve(empty);
};

export const markTopicComplete = async (planId: string, topicId: string): Promise<LearningPlan> => {
  return client.patch<Record<string, never>, LearningPlan>(`/learning-plans/${planId}/topics/${topicId}/complete`, {});
};
