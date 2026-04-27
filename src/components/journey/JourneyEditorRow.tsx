import type { PlanSubtopic } from '../../types/domain';

interface JourneyEditorRowProps {
  subtopic: PlanSubtopic;
  index: number;
  total: number;
  isSaving: boolean;
  dependencyHint?: string;
  isDragging?: boolean;
  isDragOver?: boolean;
  onToggle: (subtopicId: string) => void;
  onTitleChange: (subtopicId: string, value: string) => void;
  onDescriptionChange: (subtopicId: string, value: string) => void;
  onHoursChange: (subtopicId: string, value: number) => void;
  onMoveUp: (subtopicId: string) => void;
  onMoveDown: (subtopicId: string) => void;
  onDragStart: (subtopicId: string) => void;
  onDragEnd: () => void;
  onDragOverTarget: (targetSubtopicId: string) => void;
  onDropOver: (targetSubtopicId: string) => void;
}

export default function JourneyEditorRow({
  subtopic,
  index,
  total,
  isSaving,
  dependencyHint,
  isDragging = false,
  isDragOver = false,
  onToggle,
  onTitleChange,
  onDescriptionChange,
  onHoursChange,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  onDragOverTarget,
  onDropOver,
}: JourneyEditorRowProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(subtopic.id)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOverTarget(subtopic.id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropOver(subtopic.id);
      }}
      className={`rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 ${
        subtopic.isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:border-gray-200'
      } ${isDragging ? 'scale-[0.99] opacity-70' : ''} ${isDragOver ? 'ring-2 ring-[var(--color-accent-soft)]' : ''}`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(subtopic.id)}
          disabled={isSaving}
          aria-label={subtopic.isCompleted ? `Mark ${subtopic.title} as incomplete` : `Mark ${subtopic.title} as complete`}
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
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-400">{String(index + 1).padStart(2, '0')}</span>
            <input
              type="text"
              value={subtopic.title}
              onChange={(event) => onTitleChange(subtopic.id, event.target.value)}
              aria-label={`Title for topic ${index + 1}`}
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
              aria-label={`Estimated hours for ${subtopic.title}`}
              className="w-20 rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
            />

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMoveUp(subtopic.id)}
                disabled={index === 0}
                className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 disabled:opacity-40"
                aria-label={`Move ${subtopic.title} up`}
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(subtopic.id)}
                disabled={index === total - 1}
                className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 disabled:opacity-40"
                aria-label={`Move ${subtopic.title} down`}
              >
                Down
              </button>
            </div>
          </div>

          <textarea
            value={subtopic.description}
            onChange={(event) => onDescriptionChange(subtopic.id, event.target.value)}
            rows={2}
            aria-label={`Description for ${subtopic.title}`}
            className={`w-full rounded-md border border-gray-200 px-3 py-2 text-sm leading-relaxed text-gray-700 focus:border-gray-400 focus:outline-none ${
              subtopic.isCompleted ? 'opacity-75' : ''
            }`}
          />

          {subtopic.resources && subtopic.resources.length > 0 ? (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Learning Resources</h4>
              <ul className="flex flex-col gap-2">
                {subtopic.resources.map((resource, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-xs text-gray-500">
                      {resource.type === 'video' ? '📺' : resource.type === 'article' ? '📝' : resource.type === 'course' ? '🎓' : '📚'}
                    </span>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {dependencyHint ? (
            <p className="mt-2 text-xs text-amber-700">{dependencyHint}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
