import type { LearningPlan, ProgressSummary } from '../../types/domain';
import { deriveInsightSignals, forecastCompletionDate } from '../../utils/insights';
import { useMemo, useState } from 'react';

interface InsightsPanelProps {
  plan: LearningPlan;
  progress: ProgressSummary;
}

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
  const [weeklyHours, setWeeklyHours] = useState(6);
  const signals = useMemo(
    () => deriveInsightSignals(plan, progress, weeklyHours),
    [plan, progress, weeklyHours],
  );
  const remainingTopics = Math.max(plan.totalTopics - plan.completedTopics, 0);
  const averageHoursPerTopic =
    plan.totalTopics > 0 ? Math.max(plan.estimatedTotalHours / plan.totalTopics, 1) : 3;
  const scenarioDate = forecastCompletionDate(remainingTopics, weeklyHours, averageHoursPerTopic);

  return (
    <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-light text-gray-900">Insights</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Pace trend</p>
          <p className="mt-2 text-sm text-gray-800">{signals.paceTrend}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Drop-off risk</p>
          <p className="mt-2 text-sm text-gray-800 capitalize">{signals.dropOffRisk}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Estimated finish</p>
          <p className="mt-2 text-sm text-gray-800">{signals.estimatedCompletionDate}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Next best action</p>
          <p className="mt-2 text-sm text-gray-800">{signals.nextBestAction}</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">Forecast scenario</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm text-gray-800">
            Weekly hours
            <input
              type="range"
              min={2}
              max={14}
              step={1}
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(Number(event.target.value))}
            />
            <span>{weeklyHours}h</span>
          </label>
          <p className="text-sm text-gray-700">At this pace, finish by {scenarioDate}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <span>{getWeeklyTargetStatus(progress)}</span>
        <span>•</span>
        <span>{getStreakDays(progress)} day streak</span>
      </div>
    </section>
  );
}
