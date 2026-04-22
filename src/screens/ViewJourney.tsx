import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLearningPlan } from '../api/learningPlans';
import { getProgressSummary, toggleSubtopicCompletion as toggleSubtopicCompletionApi } from '../api/progress';
import type { LearningPlan } from '../types/domain';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useAppData } from '../state/AppDataProvider';
import JourneyEditorRow from '../components/journey/JourneyEditorRow';
import InsightsPanel from '../components/insights/InsightsPanel';
import ProgressTimeline from '../components/insights/ProgressTimeline';
import RightRailPanel from '../components/journey/RightRailPanel';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { saveJourneyEdits } from '../api/journey';
import { calculateProgressSummary, withRecalculatedProgress } from '../utils/progress';
import { exportProgressCsv, exportProgressPdf } from '../api/export';
import { featureFlags } from '../config/featureFlags';
import SocialPanels from '../components/social/SocialPanels';

interface JourneyRailState {
  notes: string;
  blockers: string;
  resources: string;
  reminderDate: string;
}

const emptyRailState: JourneyRailState = {
  notes: '',
  blockers: '',
  resources: '',
  reminderDate: '',
};

const ViewJourney = () => {
  const { setActivePlanId, setProgressSnapshot, pushToast } = useAppData();
  const [journeyData, setJourneyData] = useState<LearningPlan | null>(null);
  const [lastSavedPlan, setLastSavedPlan] = useState<LearningPlan | null>(null);
  const [draggedSubtopicId, setDraggedSubtopicId] = useState<string | null>(null);
  const [dragOverSubtopicId, setDragOverSubtopicId] = useState<string | null>(null);
  const [railDraft, setRailDraft] = useState<JourneyRailState>(emptyRailState);
  const [railSaved, setRailSaved] = useState<JourneyRailState>(emptyRailState);

  const loadJourneyPlan = useCallback(() => getLearningPlan('journey-1'), []);

  const {
    execute: loadJourney,
    status: loadStatus,
    error: loadError,
  } = useAsyncAction(loadJourneyPlan);
  const {
    execute: saveToggle,
    status: toggleStatus,
  } = useAsyncAction(toggleSubtopicCompletionApi);
  const {
    execute: persistJourney,
    status: persistStatus,
    error: persistError,
  } = useAsyncAction(saveJourneyEdits);
  const { execute: exportCsv, status: csvStatus } = useAsyncAction(exportProgressCsv);
  const { execute: exportPdf, status: pdfStatus } = useAsyncAction(exportProgressPdf);

  const hasUnsavedChanges = useMemo(() => {
    if (!journeyData || !lastSavedPlan) {
      return false;
    }

    const hasPlanChanges = JSON.stringify(journeyData) !== JSON.stringify(lastSavedPlan);
    const hasRailChanges = JSON.stringify(railDraft) !== JSON.stringify(railSaved);

    return hasPlanChanges || hasRailChanges;
  }, [journeyData, lastSavedPlan, railDraft, railSaved]);

  const { confirmNavigation } = useUnsavedChangesGuard(hasUnsavedChanges);

  const handleJourneyLoad = useCallback(async () => {
    try {
      const response = await loadJourney();
      const normalized = withRecalculatedProgress(response);
      const railStorageKey = `skillmap:journey-rail:${normalized.id}`;
      const storedRailRaw = localStorage.getItem(railStorageKey);
      let storedRail = emptyRailState;

      if (storedRailRaw) {
        try {
          storedRail = { ...emptyRailState, ...(JSON.parse(storedRailRaw) as Partial<JourneyRailState>) };
        } catch {
          storedRail = emptyRailState;
        }
      }

      setJourneyData(normalized);
      setLastSavedPlan(normalized);
      setRailDraft(storedRail);
      setRailSaved(storedRail);
      setActivePlanId(normalized.id);
      setProgressSnapshot(normalized.id, getProgressSummary(normalized));
    } catch {
      pushToast({ type: 'error', message: 'Unable to load learning journey. Please retry.' });
    }
  }, [loadJourney, pushToast, setActivePlanId, setProgressSnapshot]);

  React.useEffect(() => {
    void handleJourneyLoad();
  }, [handleJourneyLoad]);

  const updatePlan = (updater: (current: LearningPlan) => LearningPlan) => {
    setJourneyData((prev) => {
      if (!prev) {
        return prev;
      }

      const updated = withRecalculatedProgress(updater(prev));
      setProgressSnapshot(updated.id, calculateProgressSummary(updated));
      return updated;
    });
  };

  const toggleSubtopicCompletion = (subtopicId: string) => {
    if (!journeyData) {
      return;
    }

    const currentSubtopic = journeyData.subtopics.find((subtopic) => subtopic.id === subtopicId);
    if (!currentSubtopic) {
      return;
    }

    const nextIsCompleted = !currentSubtopic.isCompleted;

    updatePlan((current) => ({
      ...current,
      subtopics: current.subtopics.map((subtopic) =>
        subtopic.id === subtopicId ? { ...subtopic, isCompleted: nextIsCompleted } : subtopic,
      ),
    }));

    void (async () => {
      try {
        const updatedPlan = await saveToggle(journeyData.id, subtopicId, nextIsCompleted);
        const normalized = withRecalculatedProgress(updatedPlan);
        setJourneyData(normalized);
        setProgressSnapshot(normalized.id, calculateProgressSummary(normalized));
      } catch {
        pushToast({ type: 'error', message: 'Could not save completion update. Restoring server state.' });
        await handleJourneyLoad();
      }
    })();
  };

  const handleTitleChange = (subtopicId: string, value: string) => {
    updatePlan((current) => ({
      ...current,
      subtopics: current.subtopics.map((subtopic) =>
        subtopic.id === subtopicId ? { ...subtopic, title: value } : subtopic,
      ),
    }));
  };

  const handleDescriptionChange = (subtopicId: string, value: string) => {
    updatePlan((current) => ({
      ...current,
      subtopics: current.subtopics.map((subtopic) =>
        subtopic.id === subtopicId ? { ...subtopic, description: value } : subtopic,
      ),
    }));
  };

  const handleHoursChange = (subtopicId: string, value: number) => {
    const sanitizedHours = Number.isFinite(value) ? Math.max(1, Math.min(value, 99)) : 1;

    updatePlan((current) => ({
      ...current,
      subtopics: current.subtopics.map((subtopic) =>
        subtopic.id === subtopicId ? { ...subtopic, estimatedHours: sanitizedHours } : subtopic,
      ),
    }));
  };

  const moveSubtopic = (subtopicId: string, direction: 'up' | 'down') => {
    updatePlan((current) => {
      const index = current.subtopics.findIndex((subtopic) => subtopic.id === subtopicId);
      if (index < 0) {
        return current;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.subtopics.length) {
        return current;
      }

      const reordered = [...current.subtopics];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(targetIndex, 0, moved);

      return {
        ...current,
        subtopics: reordered,
      };
    });
  };

  const handleDropOver = (targetSubtopicId: string) => {
    if (!draggedSubtopicId || draggedSubtopicId === targetSubtopicId) {
      return;
    }

    updatePlan((current) => {
      const from = current.subtopics.findIndex((subtopic) => subtopic.id === draggedSubtopicId);
      const to = current.subtopics.findIndex((subtopic) => subtopic.id === targetSubtopicId);
      if (from < 0 || to < 0) {
        return current;
      }

      const reordered = [...current.subtopics];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);

      return {
        ...current,
        subtopics: reordered,
      };
    });

    setDragOverSubtopicId(null);
    setDraggedSubtopicId(null);
  };

  const handleSaveEdits = async () => {
    if (!journeyData) {
      return;
    }

    try {
      const saved = await persistJourney(journeyData);
      setJourneyData(saved);
      setLastSavedPlan(saved);
      setRailSaved(railDraft);
      localStorage.setItem(`skillmap:journey-rail:${saved.id}`, JSON.stringify(railDraft));
      setProgressSnapshot(saved.id, calculateProgressSummary(saved));
      pushToast({ type: 'success', message: 'Journey edits saved.' });
    } catch {
      pushToast({ type: 'error', message: 'Failed to save journey edits. Please retry.' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const navigate = useNavigate();

  const handleBackClick = () => {
    confirmNavigation(() => navigate('/dashboard'));
  };

  const handleExportCsv = async () => {
    if (!journeyData) {
      return;
    }

    try {
      const csv = await exportCsv(journeyData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${journeyData.courseName.replace(/\s+/g, '-').toLowerCase()}-progress.csv`;
      link.click();
      URL.revokeObjectURL(url);
      pushToast({ type: 'success', message: 'CSV export complete.' });
    } catch {
      pushToast({ type: 'error', message: 'CSV export failed. Please retry.' });
    }
  };

  const handleExportPdf = async () => {
    if (!journeyData) {
      return;
    }

    try {
      await exportPdf(journeyData);
      pushToast({ type: 'info', message: 'PDF export placeholder executed.' });
    } catch {
      pushToast({ type: 'error', message: 'PDF export failed. Please retry.' });
    }
  };

  if (loadStatus === 'loading') {
    return (
      <div className="min-h-screen w-full bg-gray-50/20 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <LoadingSkeleton variant="journey" />
        </div>
      </div>
    );
  }

  if (loadStatus === 'error' && loadError) {
    return (
      <div className="min-h-screen w-full bg-gray-50/20 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <ErrorState message={loadError} onRetry={() => void handleJourneyLoad()} />
        </div>
      </div>
    );
  }

  if (!journeyData) {
    return (
      <div className="min-h-screen w-full bg-gray-50/20 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <EmptyState
            title="Journey not found"
            description="We could not find a learning plan for this route yet."
            actionLabel="Back to Dashboard"
            onAction={handleBackClick}
          />
        </div>
      </div>
    );
  }

  const progress = calculateProgressSummary(journeyData);
  const nextTopic = journeyData.subtopics.find((subtopic) => !subtopic.isCompleted);
  const totalTopics = journeyData.subtopics.length;
  const foundationsEnd = Math.max(1, Math.ceil(totalTopics * 0.3));
  const buildEnd = Math.max(foundationsEnd + 1, Math.ceil(totalTopics * 0.75));

  const getSegmentLabel = (index: number): string => {
    if (index < foundationsEnd) {
      return 'Foundations';
    }

    if (index < buildEnd) {
      return 'Build';
    }

    return 'Polish';
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gray-50/20">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:px-8 lg:py-16">
        <div>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="rounded-sm bg-[#1a1a1a] p-3 font-normal text-white transition-colors hover:bg-black"
            onClick={handleBackClick}
          >
            Back to Dashboard
          </button>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {hasUnsavedChanges ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">Unsaved changes</span>
            ) : (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">All changes saved</span>
            )}
            <button
              type="button"
              onClick={() => void handleSaveEdits()}
              disabled={!hasUnsavedChanges || persistStatus === 'loading'}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {persistStatus === 'loading' ? 'Saving...' : 'Save Edits'}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-light tracking-tight text-gray-900 sm:text-4xl">{journeyData.courseName}</h1>
          <div className="flex flex-wrap items-center gap-3 text-gray-600 font-normal sm:gap-6">
            <span>Created on {formatDate(journeyData.dateCreated)}</span>
            <span>•</span>
            <span>{progress.totalTopics} topics</span>
            <span>•</span>
            <span>{progress.estimatedTotalHours} hours estimated</span>
          </div>
        </div>

        <div className="mb-10 rounded-lg border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-2 text-xl font-light text-gray-900">Learning Progress</h2>
              <p className="text-gray-600 font-normal">
                {progress.completedTopics} of {progress.totalTopics} topics completed
              </p>
            </div>
            <div className="text-right">
              <div className="mb-1 text-3xl font-light text-gray-900">{progress.completionPercentage}%</div>
              <div className="text-sm text-gray-600">
                {progress.completedHours}h / {progress.estimatedTotalHours}h
              </div>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-gray-900 transition-all duration-300"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
          {persistError ? <p className="mt-3 text-sm text-red-700">{persistError}</p> : null}
        </div>

        <section className="mb-10 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Daily focus</p>
          <h2 className="mt-2 text-2xl font-light text-[var(--color-text)]">
            {nextTopic ? nextTopic.title : 'All topics completed'}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {nextTopic
              ? `Start a focused 25-minute session to make progress on ${nextTopic.title}.`
              : 'Great work. Start a fresh roadmap from your dashboard.'}
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                navigate('/session', {
                  state: {
                    planId: journeyData.id,
                    subtopicId: nextTopic?.id,
                    title: nextTopic?.title ?? journeyData.courseName,
                    minutes: 25,
                  },
                })
              }
              disabled={!nextTopic}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Start 25-min session
            </button>
          </div>
        </section>

        {featureFlags.enableInsights ? <InsightsPanel plan={journeyData} progress={progress} /> : null}
        {featureFlags.enableInsights ? <ProgressTimeline subtopics={journeyData.subtopics} /> : null}
        {featureFlags.enableSocial && (featureFlags.enableSharing || featureFlags.enableAccountability) ? (
          <SocialPanels plan={journeyData} />
        ) : null}

        <div className="mb-8">
          <h2 className="mb-8 text-2xl font-light tracking-tight text-gray-900">Learning Path</h2>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Foundations</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">Topics 1-{foundationsEnd}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Build</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">Topics {Math.min(foundationsEnd + 1, totalTopics)}-{Math.min(buildEnd, totalTopics)}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Polish</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">Topics {Math.min(buildEnd + 1, totalTopics)}-{totalTopics}</p>
            </div>
          </div>

          <div className="space-y-4">
            {journeyData.subtopics.map((subtopic, index) => (
              <div key={subtopic.id}>
                {index === 0 || getSegmentLabel(index) !== getSegmentLabel(index - 1) ? (
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    {getSegmentLabel(index)}
                  </p>
                ) : null}
                <JourneyEditorRow
                  subtopic={subtopic}
                  index={index}
                  total={journeyData.subtopics.length}
                  isSaving={toggleStatus === 'loading'}
                  dependencyHint={index > 0 ? `Recommended: complete ${journeyData.subtopics[index - 1].title} first.` : undefined}
                  isDragging={draggedSubtopicId === subtopic.id}
                  isDragOver={dragOverSubtopicId === subtopic.id}
                  onToggle={toggleSubtopicCompletion}
                  onTitleChange={handleTitleChange}
                  onDescriptionChange={handleDescriptionChange}
                  onHoursChange={handleHoursChange}
                  onMoveUp={(id) => moveSubtopic(id, 'up')}
                  onMoveDown={(id) => moveSubtopic(id, 'down')}
                  onDragStart={(id) => setDraggedSubtopicId(id)}
                  onDragEnd={() => {
                    setDraggedSubtopicId(null);
                    setDragOverSubtopicId(null);
                  }}
                  onDragOverTarget={(id) => setDragOverSubtopicId(id)}
                  onDropOver={(id) => handleDropOver(id)}
                />
              </div>
            ))}
          </div>
        </div>

        {featureFlags.enableExport ? (
          <div className="flex flex-col justify-center gap-3 pt-8 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => void handleExportCsv()}
              disabled={csvStatus === 'loading'}
              className="rounded-lg border border-gray-200 bg-white px-8 py-3 font-normal text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {csvStatus === 'loading' ? 'Exporting CSV...' : 'Export CSV'}
            </button>
            <button
              type="button"
              onClick={() => void handleExportPdf()}
              disabled={pdfStatus === 'loading'}
              className="rounded-lg bg-gray-900 px-8 py-3 font-normal text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {pdfStatus === 'loading' ? 'Exporting PDF...' : 'Export PDF'}
            </button>
          </div>
        ) : null}
        </div>

        <div className="space-y-4">
          <RightRailPanel
            notes={railDraft.notes}
            blockers={railDraft.blockers}
            resources={railDraft.resources}
            reminderDate={railDraft.reminderDate}
            onNotesChange={(value) => setRailDraft((current) => ({ ...current, notes: value }))}
            onBlockersChange={(value) => setRailDraft((current) => ({ ...current, blockers: value }))}
            onResourcesChange={(value) => setRailDraft((current) => ({ ...current, resources: value }))}
            onReminderDateChange={(value) => setRailDraft((current) => ({ ...current, reminderDate: value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewJourney;
