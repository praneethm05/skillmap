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
    if (!canGenerate) {
      return;
    }

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
    if (!generatedPlan) {
      return;
    }

    onPlanGenerated(generatedPlan);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
        
        {/* Step 1: Input */}
        {modalStep === 'input' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-gray-900 mb-3">
                What would you like to learn?
              </h2>
              <p className="text-gray-500 font-normal">
                Enter goals and preferences to generate your learning roadmap
              </p>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={formState.topic}
                onChange={(event) => setFormState((current) => ({ ...current, topic: event.target.value }))}
                placeholder="e.g., Machine Learning, React.js, Data Structures"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent font-normal"
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && canGenerate) {
                    void runGeneration();
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <select
                value={formState.currentLevel}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    currentLevel: event.target.value as LearningGoalInput['currentLevel'],
                  }))
                }
                className="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input
                type="number"
                min={1}
                max={40}
                value={formState.weeklyHours}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    weeklyHours: Number(event.target.value),
                  }))
                }
                placeholder="Weekly hours"
                className="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <input
                type="number"
                min={1}
                max={52}
                value={formState.targetWeeks}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    targetWeeks: Number(event.target.value),
                  }))
                }
                placeholder="Target weeks"
                className="px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <label className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700">
                Test failure
                <input
                  type="checkbox"
                  checked={Boolean(formState.forceFailure)}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      forceFailure: event.target.checked,
                    }))
                  }
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 text-gray-600 font-normal border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void runGeneration()}
                disabled={!canGenerate}
                className="flex-1 px-6 py-3 bg-gray-900 text-white font-normal rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Generate Plan
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generating */}
        {modalStep === 'generating' && (
          <div className="p-8 text-center">
            <div className="mb-8">
              <div className="w-12 h-12 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">
                Generating Learning Plan
              </h2>
              <p className="text-gray-500 font-normal">
                Creating a personalized roadmap for <span className="font-medium">{formState.topic.trim()}</span>
              </p>
              {isGenerating ? <p className="mt-3 text-xs text-gray-400">Collecting topics and sequencing modules...</p> : null}
            </div>
          </div>
        )}

        {/* Step 3: Generated */}
        {modalStep === 'result' && generatedPlan ? (
          <div className="p-8 text-center">
            <div className="mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">
                Learning Plan Generated
              </h2>
              <p className="text-gray-500 font-normal">
                Your personalized roadmap for <span className="font-medium">{generatedPlan.courseName}</span> is ready
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {generatedPlan.totalTopics} topics • {generatedPlan.estimatedTotalHours} estimated hours
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 text-gray-600 font-normal border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleViewPlan}
                className="flex-1 px-6 py-3 bg-gray-900 text-white font-normal rounded-lg hover:bg-gray-800 transition-colors"
              >
                View Plan
              </button>
            </div>
          </div>
        ) : null}

        {modalStep === 'error' ? (
          <div className="p-8 text-center">
            <div className="mb-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-3">Generation failed</h2>
              <p className="text-gray-500 font-normal">{generationError ?? 'Could not generate a plan right now.'}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalStep('input')}
                className="flex-1 px-6 py-3 text-gray-600 font-normal border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit Inputs
              </button>
              <button
                onClick={() => void runGeneration()}
                className="flex-1 px-6 py-3 bg-gray-900 text-white font-normal rounded-lg hover:bg-gray-800 transition-colors"
              >
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
