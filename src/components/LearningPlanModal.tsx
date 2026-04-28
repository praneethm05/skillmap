import { useMemo, useState } from 'react';
import { createLearningPlan } from '../api/learningPlans';
import { useAsyncAction } from '../hooks/useAsyncAction';
import type { LearningGoalInput, LearningPlan } from '../types/domain';
import { useAppData } from '../state/AppDataProvider';

type LearningPlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (plan: LearningPlan) => void;
};

type ModalStep = 'input' | 'generating' | 'result' | 'error';

const LearningPlanModal = ({ isOpen, onClose, onPlanGenerated }: LearningPlanModalProps) => {
  const { pushToast } = useAppData();
  const [modalStep, setModalStep] = useState<ModalStep>('input');
  const [formState, setFormState] = useState<LearningGoalInput>({
    topic: '',
    currentLevel: 'beginner',
    weeklyHours: 6,
    targetWeeks: 8,
    forceFailure: false,
  });
  const [generatedPlan, setGeneratedPlan] = useState<LearningPlan | null>(null);
  const {
    execute: generatePlan,
    isLoading: isGenerating,
    error: generationError,
    reset: resetGenerationState,
  } = useAsyncAction(createLearningPlan);

  const canGenerate = useMemo(
    () => formState.topic.trim().length > 2,
    [formState.topic],
  );

  const runGeneration = async () => {
    if (!canGenerate) return;
    setModalStep('generating');
    try {
      const plan = await generatePlan({
        topic: formState.topic.trim(),
        currentLevel: formState.currentLevel,
        weeklyHours: formState.weeklyHours,
        targetWeeks: formState.targetWeeks,
        forceFailure: formState.forceFailure,
      });
      setGeneratedPlan(plan);
      setModalStep('result');
      pushToast({ type: 'success', message: 'Learning plan generated successfully.' });
    } catch {
      setModalStep('error');
      pushToast({ type: 'error', message: 'Plan generation failed. Review and retry.' });
    }
  };

  const handleClose = () => {
    setModalStep('input');
    setGeneratedPlan(null);
    setFormState({
      topic: '',
      currentLevel: 'beginner',
      weeklyHours: 6,
      targetWeeks: 8,
      forceFailure: false,
    });
    resetGenerationState();
    onClose();
  };

  const handleViewPlan = () => {
    if (!generatedPlan) return;
    onPlanGenerated(generatedPlan);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-[var(--shadow-raised)] modal-enter"
        role="dialog"
        aria-modal="true"
        aria-labelledby="learning-plan-modal-title"
      >
        {/* Step 1: Input */}
        {modalStep === 'input' && (
          <div className="p-7 sm:p-8">
            <div className="mb-7 text-center">
              <h2
                id="learning-plan-modal-title"
                className="mb-2 text-[var(--color-text)]"
                style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
              >
                What would you like to learn?
              </h2>
              <p className="text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-body)' }}>
                We'll generate a personalized roadmap for you
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="modal-topic"
                  className="mb-1.5 block text-[var(--color-text)]"
                  style={{ fontSize: 'var(--text-caption)', fontWeight: 500 }}
                >
                  Topic
                </label>
                <input
                  id="modal-topic"
                  type="text"
                  value={formState.topic}
                  onChange={(e) => setFormState((c) => ({ ...c, topic: e.target.value }))}
                  placeholder="e.g., Machine Learning, React.js, Data Structures"
                  className="w-full rounded-[0.625rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-soft)]"
                  style={{ fontSize: 'var(--text-body)' }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canGenerate) void runGeneration();
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="modal-level"
                    className="mb-1.5 block text-[var(--color-text)]"
                    style={{ fontSize: 'var(--text-caption)', fontWeight: 500 }}
                  >
                    Current level
                  </label>
                  <select
                    id="modal-level"
                    value={formState.currentLevel}
                    onChange={(e) =>
                      setFormState((c) => ({
                        ...c,
                        currentLevel: e.target.value as LearningGoalInput['currentLevel'],
                      }))
                    }
                    className="w-full rounded-[0.625rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-soft)]"
                    style={{ fontSize: 'var(--text-body)' }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="modal-hours"
                    className="mb-1.5 block text-[var(--color-text)]"
                    style={{ fontSize: 'var(--text-caption)', fontWeight: 500 }}
                  >
                    Weekly hours
                  </label>
                  <input
                    id="modal-hours"
                    type="number"
                    min={1}
                    max={40}
                    value={formState.weeklyHours}
                    onChange={(e) =>
                      setFormState((c) => ({ ...c, weeklyHours: Number(e.target.value) }))
                    }
                    className="w-full rounded-[0.625rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-soft)]"
                    style={{ fontSize: 'var(--text-body)' }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-weeks"
                  className="mb-1.5 block text-[var(--color-text)]"
                  style={{ fontSize: 'var(--text-caption)', fontWeight: 500 }}
                >
                  Target weeks
                </label>
                <input
                  id="modal-weeks"
                  type="number"
                  min={1}
                  max={52}
                  value={formState.targetWeeks}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, targetWeeks: Number(e.target.value) }))
                  }
                  className="w-full rounded-[0.625rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-soft)]"
                  style={{ fontSize: 'var(--text-body)' }}
                />
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button onClick={handleClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => void runGeneration()}
                disabled={!canGenerate}
                className="btn-primary flex-1"
              >
                Generate Plan
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generating */}
        {modalStep === 'generating' && (
          <div className="p-8 text-center sm:p-10">
            <div className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
            <h2
              className="mb-2 text-[var(--color-text)]"
              style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
            >
              Generating your roadmap
            </h2>
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-body)' }}>
              Creating a personalized plan for{' '}
              <span style={{ fontWeight: 500 }}>{formState.topic.trim()}</span>
            </p>
            {isGenerating ? (
              <p className="mt-3 text-[var(--color-text-subtle)]" style={{ fontSize: 'var(--text-caption)' }}>
                Collecting topics and sequencing modules…
              </p>
            ) : null}
          </div>
        )}

        {/* Step 3: Generated */}
        {modalStep === 'result' && generatedPlan ? (
          <div className="p-8 text-center sm:p-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-soft)] celebrate-pop">
              <svg className="h-7 w-7 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2
              className="mb-2 text-[var(--color-text)]"
              style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
            >
              Plan ready
            </h2>
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-body)' }}>
              Your roadmap for <span style={{ fontWeight: 500 }}>{generatedPlan.courseName}</span> is ready
            </p>
            <p className="mt-1 text-[var(--color-text-subtle)]" style={{ fontSize: 'var(--text-caption)' }}>
              {generatedPlan.totalTopics} topics · {generatedPlan.estimatedTotalHours} estimated hours
            </p>
            <div className="mt-7 flex gap-3">
              <button onClick={handleClose} className="btn-secondary flex-1">
                Close
              </button>
              <button onClick={handleViewPlan} className="btn-primary flex-1">
                View Plan
              </button>
            </div>
          </div>
        ) : null}

        {/* Step 4: Error */}
        {modalStep === 'error' ? (
          <div className="p-8 text-center sm:p-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-warning-soft)]">
              <svg className="h-7 w-7 text-[var(--color-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2
              className="mb-2 text-[var(--color-text)]"
              style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
            >
              Generation failed
            </h2>
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-body)' }}>
              {generationError ?? 'Could not generate a plan right now.'}
            </p>
            <div className="mt-7 flex gap-3">
              <button onClick={() => setModalStep('input')} className="btn-secondary flex-1">
                Edit Inputs
              </button>
              <button onClick={() => void runGeneration()} className="btn-primary flex-1">
                Retry
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default LearningPlanModal;
