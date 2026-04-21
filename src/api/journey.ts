import type { LearningPlan } from '../types/domain';
import { withRecalculatedProgress } from '../utils/progress';

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), ms);
  });

export const saveJourneyEdits = async (plan: LearningPlan): Promise<LearningPlan> => {
  await delay(450);

  const shouldFail = plan.subtopics.some((subtopic) => subtopic.title.toLowerCase().includes('[fail]'));
  if (shouldFail) {
    throw new Error('Could not save journey edits. Remove [fail] and retry.');
  }

  return withRecalculatedProgress(plan);
};
