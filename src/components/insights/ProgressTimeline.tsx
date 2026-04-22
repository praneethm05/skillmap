import type { PlanSubtopic } from '../../types/domain';

interface ProgressTimelineProps {
  subtopics: PlanSubtopic[];
}

export default function ProgressTimeline({ subtopics }: ProgressTimelineProps) {
  const timelineItems = subtopics
    .filter((subtopic) => subtopic.isCompleted)
    .slice(-5)
    .reverse();
  const totalHours = timelineItems.reduce((sum, item) => sum + item.estimatedHours, 0);

  return (
    <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-light text-gray-900">Recent Progress</h2>
      {timelineItems.length > 0 ? (
        <p className="mb-4 text-sm text-gray-600">
          This week you completed {timelineItems.length} topics and invested {totalHours} focused hours.
        </p>
      ) : null}
      {timelineItems.length === 0 ? (
        <p className="text-sm text-gray-600">Complete a topic to start your progress timeline.</p>
      ) : (
        <div className="space-y-3">
          {timelineItems.map((item, index) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs text-green-700">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">Completed • {item.estimatedHours}h invested</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
