import type { PlanSubtopic } from '../../types/domain';

interface JourneyEditorRowProps {
  subtopic: PlanSubtopic;
  index: number;
  isSaving: boolean;
  onToggle: (subtopicId: string) => void;
  onTitleChange: (subtopicId: string, value: string) => void;
  onDescriptionChange: (subtopicId: string, value: string) => void;
  onHoursChange: (subtopicId: string, value: number) => void;
}

export default function JourneyEditorRow({
  subtopic,
  index,
  isSaving,
  onToggle,
  onTitleChange,
  onDescriptionChange,
  onHoursChange,
}: JourneyEditorRowProps) {
  return (
    <div
      className={`rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 ${
        subtopic.isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(subtopic.id)}
          disabled={isSaving}
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-200 ${
            subtopic.isCompleted
              ? 'border-green-600 bg-green-600'
              : 'border-gray-300 hover:border-gray-400'
          } ${isSaving ? 'cursor-not-allowed opacity-70' : ''}`}
        >
          {subtopic.isCompleted ? (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400">{String(index + 1).padStart(2, '0')}</span>
            <input
              type="text"
              value={subtopic.title}
              onChange={(event) => onTitleChange(subtopic.id, event.target.value)}
              className={`w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-lg focus:border-gray-300 focus:outline-none ${
                subtopic.isCompleted ? 'text-gray-600 line-through' : 'text-gray-900'
              }`}
            />
            <input
              type="number"
              min={1}
              max={99}
              value={subtopic.estimatedHours}
              onChange={(event) => onHoursChange(subtopic.id, Number(event.target.value))}
              className="w-20 rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <textarea
            value={subtopic.description}
            onChange={(event) => onDescriptionChange(subtopic.id, event.target.value)}
            rows={2}
            className={`w-full rounded-md border border-gray-200 px-3 py-2 text-sm leading-relaxed text-gray-700 focus:border-gray-400 focus:outline-none ${
              subtopic.isCompleted ? 'opacity-75' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
}
