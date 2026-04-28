import type { PlanSubtopic } from '../../types/domain';
import { useState } from 'react';

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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const isCompleted = subtopic.isCompleted;

  // Determine the next incomplete topic for "current" styling
  const isCurrent = !isCompleted && index === 0; // Simplified — parent can override

  const dotClass = isCompleted
    ? 'timeline-dot--completed'
    : isCurrent
      ? 'timeline-dot--current'
      : 'timeline-dot--future';

  return (
    <div
      draggable
      onDragStart={() => onDragStart(subtopic.id)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => { event.preventDefault(); onDragOverTarget(subtopic.id); }}
      onDrop={(event) => { event.preventDefault(); onDropOver(subtopic.id); }}
      className={`relative flex gap-4 transition-all duration-200 ${
        isDragging ? 'scale-[0.99] opacity-60' : ''
      } ${isDragOver ? 'ring-2 ring-[var(--color-accent-soft)] rounded-lg' : ''}`}
    >
      {/* Timeline column */}
      <div className="relative flex flex-col items-center pt-1">
        {index < total - 1 ? <div className="timeline-line" style={{ top: '28px' }} /> : null}
        <div className={`timeline-dot ${dotClass}`}>
          {isCompleted ? (
            <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span>{String(index + 1).padStart(2, '0')}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={`mb-4 min-w-0 flex-1 rounded-xl border p-5 transition-all duration-200 ${
          isCompleted
            ? 'border-[var(--color-success-muted)]/40 bg-[var(--color-success-soft)]/50'
            : 'border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-[var(--color-border)] hover:shadow-[var(--shadow-soft)]'
        }`}
      >
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {/* Toggle */}
          <button
            onClick={() => onToggle(subtopic.id)}
            disabled={isSaving}
            aria-label={isCompleted ? `Mark ${subtopic.title} as incomplete` : `Mark ${subtopic.title} as complete`}
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-200 ${
              isCompleted
                ? 'border-[var(--color-success)] bg-[var(--color-success)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
            } ${isSaving ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {isCompleted ? (
              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : null}
          </button>

          {/* Title — click to edit */}
          {isEditingTitle ? (
            <input
              type="text"
              value={subtopic.title}
              onChange={(event) => onTitleChange(subtopic.id, event.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
              autoFocus
              aria-label={`Title for topic ${index + 1}`}
              className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
              style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className={`min-w-0 flex-1 rounded-md px-2 py-1 text-left transition-colors hover:bg-[var(--color-surface-muted)] ${
                isCompleted ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text)]'
              }`}
              style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}
              title="Click to edit title"
            >
              {subtopic.title}
            </button>
          )}

          {/* Hours */}
          <input
            type="number"
            min={1}
            max={99}
            value={subtopic.estimatedHours}
            onChange={(event) => onHoursChange(subtopic.id, Number(event.target.value))}
            aria-label={`Estimated hours for ${subtopic.title}`}
            className="w-16 rounded-md border border-[var(--color-border-light)] px-2 py-1 text-center text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
            style={{ fontSize: 'var(--text-caption)' }}
          />
          <span className="text-[var(--color-text-subtle)]" style={{ fontSize: 'var(--text-overline)' }}>hrs</span>

          {/* Reorder — icon buttons */}
          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onMoveUp(subtopic.id)}
              disabled={index === 0}
              className="btn-ghost !p-1 disabled:opacity-30"
              aria-label={`Move ${subtopic.title} up`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(subtopic.id)}
              disabled={index === total - 1}
              className="btn-ghost !p-1 disabled:opacity-30"
              aria-label={`Move ${subtopic.title} down`}
            >
              ↓
            </button>
          </div>
        </div>

        <textarea
          value={subtopic.description}
          onChange={(event) => onDescriptionChange(subtopic.id, event.target.value)}
          rows={2}
          aria-label={`Description for ${subtopic.title}`}
          className={`w-full rounded-md border border-[var(--color-border-light)] bg-[var(--color-surface-elevated)] px-3 py-2 leading-relaxed text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none ${
            isCompleted ? 'opacity-60' : ''
          }`}
          style={{ fontSize: 'var(--text-caption)' }}
        />

        {subtopic.resources && subtopic.resources.length > 0 ? (
          <div className="mt-3 border-t border-[var(--color-border-light)] pt-3">
            <p
              className="mb-2 uppercase tracking-widest text-[var(--color-text-subtle)]"
              style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
            >
              Resources
            </p>
            <ul className="flex flex-col gap-1.5">
              {subtopic.resources.map((resource, i) => (
                <li key={i}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
                    style={{ fontSize: 'var(--text-caption)' }}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-sm bg-[var(--color-accent-soft)]"
                      style={{ fontSize: '8px' }}
                    >
                      {resource.type === 'video' ? '▶' : resource.type === 'article' ? '¶' : resource.type === 'course' ? '◆' : '◇'}
                    </span>
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {dependencyHint ? (
          <p className="mt-2 text-[var(--color-warning)]" style={{ fontSize: 'var(--text-overline)' }}>
            {dependencyHint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
