import type { LearningPlan, ProgressSummary } from '../../types/domain';

interface InsightsPanelProps {
  plan: LearningPlan;
  progress: ProgressSummary;
}

const dayMs = 1000 * 60 * 60 * 24;

const estimateCompletionDate = (plan: LearningPlan) => {
  const remainingTopics = Math.max(plan.totalTopics - plan.completedTopics, 0);
  const daysToComplete = Math.max(remainingTopics * 2, 1);
  const completionDate = new Date(Date.now() + daysToComplete * dayMs);

  return completionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getNextRecommendedTopic = (plan: LearningPlan): string => {
  const next = plan.subtopics.find((subtopic) => !subtopic.isCompleted);
  return next ? next.title : 'All topics completed';
};

const getWeeklyTargetStatus = (progress: ProgressSummary): string => {
  const weeklyTarget = 6;
  if (progress.completedHours >= weeklyTarget) {
    return `Target met (${progress.completedHours}h / ${weeklyTarget}h)`;
  }

  return `${weeklyTarget - progress.completedHours}h left this week`;
};

const getStreakDays = (progress: ProgressSummary): number => {
  if (progress.completedTopics === 0) {
    return 0;
  }

  return Math.min(progress.completedTopics + 1, 14);
};

export default function InsightsPanel({ plan, progress }: InsightsPanelProps) {
  return (
    <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-light text-gray-900">Insights</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Weekly target</p>
          <p className="mt-2 text-sm text-gray-800">{getWeeklyTargetStatus(progress)}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Streak</p>
          <p className="mt-2 text-sm text-gray-800">{getStreakDays(progress)} day streak</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Estimated finish</p>
          <p className="mt-2 text-sm text-gray-800">{estimateCompletionDate(plan)}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Next topic</p>
          <p className="mt-2 text-sm text-gray-800">{getNextRecommendedTopic(plan)}</p>
        </div>
      </div>
    </section>
  );
}
