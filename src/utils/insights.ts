import type { LearningPlan, ProgressSummary } from '../types/domain';

export interface InsightSignals {
  paceTrend: string;
  paceDirection: 'up' | 'down' | 'steady';
  dropOffRisk: 'low' | 'moderate' | 'high';
  nextBestAction: string;
  estimatedCompletionDate: string;
}

const dayMs = 1000 * 60 * 60 * 24;

export const forecastCompletionDate = (
  remainingTopics: number,
  weeklyHours: number,
  averageHoursPerTopic: number,
): string => {
  const safeWeeklyHours = Math.max(weeklyHours, 1);
  const safeHoursPerTopic = Math.max(averageHoursPerTopic, 1);
  const remainingHours = remainingTopics * safeHoursPerTopic;
  const weeksNeeded = Math.max(1, Math.ceil(remainingHours / safeWeeklyHours));
  const forecastDate = new Date(Date.now() + weeksNeeded * 7 * dayMs);

  return forecastDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const deriveInsightSignals = (
  plan: LearningPlan,
  progress: ProgressSummary,
  weeklyHours: number,
): InsightSignals => {
  const remainingTopics = Math.max(plan.totalTopics - plan.completedTopics, 0);
  const averageHoursPerTopic =
    plan.totalTopics > 0 ? Math.max(plan.estimatedTotalHours / plan.totalTopics, 1) : 3;
  const estimatedCompletionDate = forecastCompletionDate(
    remainingTopics,
    weeklyHours,
    averageHoursPerTopic,
  );

  const paceDirection: InsightSignals['paceDirection'] =
    progress.completionPercentage >= 70 ? 'up' : progress.completionPercentage >= 35 ? 'steady' : 'down';

  const paceTrend =
    paceDirection === 'up'
      ? 'Pace is accelerating this week.'
      : paceDirection === 'steady'
        ? 'Pace is steady. Keep consistency.'
        : 'Pace has slowed. Start one focus block today.';

  const dropOffRisk: InsightSignals['dropOffRisk'] =
    progress.completedTopics === 0
      ? 'high'
      : progress.completionPercentage > 60
        ? 'low'
        : 'moderate';

  const nextTopic = plan.subtopics.find((subtopic) => !subtopic.isCompleted);
  const nextBestAction = nextTopic
    ? `Complete ${nextTopic.title} in a 25-minute session.`
    : 'Celebrate completion and generate the next roadmap.';

  return {
    paceTrend,
    paceDirection,
    dropOffRisk,
    nextBestAction,
    estimatedCompletionDate,
  };
};
