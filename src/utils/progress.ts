import type { LearningPlan, ProgressSummary } from '../types/domain';

export const calculateProgressSummary = (plan: LearningPlan): ProgressSummary => {
  const completedTopics = plan.subtopics.filter((subtopic) => subtopic.isCompleted).length;
  const completedHours = plan.subtopics
    .filter((subtopic) => subtopic.isCompleted)
    .reduce((total, subtopic) => total + subtopic.estimatedHours, 0);
  const estimatedTotalHours = plan.subtopics.reduce(
    (total, subtopic) => total + subtopic.estimatedHours,
    0,
  );
  const totalTopics = plan.subtopics.length;
  const completionPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return {
    totalTopics,
    completedTopics,
    completionPercentage,
    completedHours,
    estimatedTotalHours,
  };
};

export const withRecalculatedProgress = (plan: LearningPlan): LearningPlan => {
  const summary = calculateProgressSummary(plan);

  return {
    ...plan,
    totalTopics: summary.totalTopics,
    completedTopics: summary.completedTopics,
    estimatedTotalHours: summary.estimatedTotalHours,
  };
};
