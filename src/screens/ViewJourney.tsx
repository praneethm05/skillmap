import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLearningPlan, getLearningPlans } from '../api/learningPlans';
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
}

const emptyRailState: JourneyRailState = {
  notes: '',
  blockers: '',
};

const PROGRESS_RING_R = 36;
const PROGRESS_RING_C = 2 * Math.PI * PROGRESS_RING_R;

const ViewJourney = () => {
  const { activePlanId, setActivePlanId, setProgressSnapshot, pushToast } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();
  const [journeyData, setJourneyData] = useState<LearningPlan | null>(null);
  const [lastSavedPlan, setLastSavedPlan] = useState<LearningPlan | null>(null);
  const [draggedSubtopicId, setDraggedSubtopicId] = useState<string | null>(null);
  const [dragOverSubtopicId, setDragOverSubtopicId] = useState<string | null>(null);
  const [railDraft, setRailDraft] = useState<JourneyRailState>(emptyRailState);
  const [railSaved, setRailSaved] = useState<JourneyRailState>(emptyRailState);

  const loadJourneyPlan = useCallback(() => {
    if (activePlanId) {
      return getLearningPlan(activePlanId);
    }

    return getLearningPlans().then((plans) => {
      const firstPlan = plans[0];
      if (!firstPlan) {
        throw new Error('No learning plan found. Generate a plan from your dashboard first.');
      }
      return firstPlan;
    });
  }, [activePlanId]);

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
    if (!journeyData || !lastSavedPlan) return false;
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

  React.useEffect(() => {
    const state = location.state as
      | { sessionCompleted?: boolean; completedTopicTitle?: string; reflection?: string }
      | undefined;

    if (state?.sessionCompleted) {
      pushToast({
        type: 'success',
        message: state.completedTopicTitle
          ? `Session recorded for ${state.completedTopicTitle}.`
          : 'Session recorded successfully.',
      });
    }
  }, [location.state, pushToast]);

  const updatePlan = (updater: (current: LearningPlan) => LearningPlan) => {
    setJourneyData((prev) => {
      if (!prev) return prev;
      const updated = withRecalculatedProgress(updater(prev));
      setProgressSnapshot(updated.id, calculateProgressSummary(updated));
      return updated;
    });
  };

  const toggleSubtopicCompletion = (subtopicId: string) => {
    if (!journeyData) return;
    const currentSubtopic = journeyData.subtopics.find((s) => s.id === subtopicId);
    if (!currentSubtopic) return;
    const nextIsCompleted = !currentSubtopic.isCompleted;

    updatePlan((current) => ({
      ...current,
      subtopics: current.subtopics.map((s) =>
        s.id === subtopicId ? { ...s, isCompleted: nextIsCompleted } : s,
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
      subtopics: current.subtopics.map((s) =>
        s.id === subtopicId ? { ...s, title: value } : s,
      ),
    }));
  };

  const handleDescriptionChange = (subtopicId: string, value: string) => {
    updatePlan((current) => ({
      ...current,
      subtopics: current.subtopics.map((s) =>
        s.id === subtopicId ? { ...s, description: value } : s,
      ),
    }));
  };

  const handleHoursChange = (subtopicId: string, value: number) => {
    const sanitizedHours = Number.isFinite(value) ? Math.max(1, Math.min(value, 99)) : 1;
    updatePlan((current) => ({
      ...current,
      subtopics: current.subtopics.map((s) =>
        s.id === subtopicId ? { ...s, estimatedHours: sanitizedHours } : s,
      ),
    }));
  };

  const moveSubtopic = (subtopicId: string, direction: 'up' | 'down') => {
    updatePlan((current) => {
      const index = current.subtopics.findIndex((s) => s.id === subtopicId);
      if (index < 0) return current;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.subtopics.length) return current;
      const reordered = [...current.subtopics];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(targetIndex, 0, moved);
      return { ...current, subtopics: reordered };
    });
  };

  const handleDropOver = (targetSubtopicId: string) => {
    if (!draggedSubtopicId || draggedSubtopicId === targetSubtopicId) return;
    updatePlan((current) => {
      const from = current.subtopics.findIndex((s) => s.id === draggedSubtopicId);
      const to = current.subtopics.findIndex((s) => s.id === targetSubtopicId);
      if (from < 0 || to < 0) return current;
      const reordered = [...current.subtopics];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      return { ...current, subtopics: reordered };
    });
    setDragOverSubtopicId(null);
    setDraggedSubtopicId(null);
  };

  const handleSaveEdits = async () => {
    if (!journeyData) return;
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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleBackClick = () => {
    confirmNavigation(() => navigate('/dashboard'));
  };

  const handleExportCsv = async () => {
    if (!journeyData) return;
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
    if (!journeyData) return;
    try {
      await exportPdf(journeyData);
      pushToast({ type: 'info', message: 'PDF export placeholder executed.' });
    } catch {
      pushToast({ type: 'error', message: 'PDF export failed. Please retry.' });
    }
  };

  if (loadStatus === 'loading') {
    return (
      <div className="min-h-screen w-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
          <LoadingSkeleton variant="journey" />
        </div>
      </div>
    );
  }

  if (loadStatus === 'error' && loadError) {
    return (
      <div className="min-h-screen w-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
          <ErrorState message={loadError} onRetry={() => void handleJourneyLoad()} />
        </div>
      </div>
    );
  }

  if (!journeyData) {
    return (
      <div className="min-h-screen w-full overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
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
  const nextTopic = journeyData.subtopics.find((s) => !s.isCompleted);
  const totalTopics = journeyData.subtopics.length;
  const foundationsEnd = Math.max(1, Math.ceil(totalTopics * 0.3));
  const buildEnd = Math.max(foundationsEnd + 1, Math.ceil(totalTopics * 0.75));
  const ringOffset = PROGRESS_RING_C * (1 - progress.completionPercentage / 100);

  const getSegmentLabel = (index: number): string => {
    if (index < foundationsEnd) return 'Foundations';
    if (index < buildEnd) return 'Build';
    return 'Polish';
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto page-enter">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 lg:px-8 lg:py-14">
        <div>
          {/* Toolbar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 fade-in-up">
            <button className="btn-ghost" onClick={handleBackClick}>
              ← Dashboard
            </button>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges ? (
                <span
                  className="rounded-full bg-[var(--color-warning-soft)] px-3 py-1 text-[var(--color-warning)]"
                  style={{ fontSize: 'var(--text-overline)', fontWeight: 500 }}
                >
                  Unsaved changes
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => void handleSaveEdits()}
                disabled={!hasUnsavedChanges || persistStatus === 'loading'}
                className="btn-primary"
              >
                {persistStatus === 'loading' ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {/* Header */}
          <header className="mb-8 fade-in-up" style={{ animationDelay: '60ms' }}>
            <h1
              className="mb-2 tracking-tight text-[var(--color-text)]"
              style={{ fontSize: 'var(--text-display)', fontWeight: 300 }}
            >
              {journeyData.courseName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-caption)' }}>
              <span>Created {formatDate(journeyData.dateCreated)}</span>
              <span>·</span>
              <span>{progress.totalTopics} topics</span>
              <span>·</span>
              <span>{progress.estimatedTotalHours}h estimated</span>
            </div>
          </header>

          {/* Progress card with ring */}
          <div className="glass-card mb-8 flex items-center gap-6 p-5 fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="relative h-20 w-20 flex-shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40" cy="40" r={PROGRESS_RING_R}
                  fill="none" stroke="var(--color-border-light)" strokeWidth="5"
                />
                <circle
                  cx="40" cy="40" r={PROGRESS_RING_R}
                  fill="none" stroke="var(--color-accent)" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={PROGRESS_RING_C}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-[var(--color-text)]"
                  style={{ fontSize: 'var(--text-subheading)', fontWeight: 600 }}
                >
                  {progress.completionPercentage}%
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[var(--color-text)]" style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}>
                {progress.completedTopics} of {progress.totalTopics} topics completed
              </p>
              <p className="text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-caption)' }}>
                {progress.completedHours}h / {progress.estimatedTotalHours}h
              </p>
              {persistError ? (
                <p className="mt-2 text-[var(--color-error)]" style={{ fontSize: 'var(--text-caption)' }}>
                  {persistError}
                </p>
              ) : null}
            </div>
            {nextTopic ? (
              <button
                type="button"
                onClick={() =>
                  navigate('/session', {
                    state: {
                      planId: journeyData.id,
                      subtopicId: nextTopic.id,
                      title: nextTopic.title,
                      minutes: 25,
                    },
                  })
                }
                className="btn-primary hidden sm:flex"
              >
                Start session
              </button>
            ) : null}
          </div>

          {featureFlags.enableInsights ? <InsightsPanel plan={journeyData} progress={progress} /> : null}
          {featureFlags.enableInsights ? <ProgressTimeline subtopics={journeyData.subtopics} /> : null}
          {featureFlags.enableSocial && (featureFlags.enableSharing || featureFlags.enableAccountability) ? (
            <SocialPanels plan={journeyData} />
          ) : null}

          {/* Learning path with timeline */}
          <section className="mb-8">
            <div className="mb-6 flex items-center justify-between gap-3 fade-in-up" style={{ animationDelay: '140ms' }}>
              <h2
                className="text-[var(--color-text)]"
                style={{ fontSize: 'var(--text-heading)', fontWeight: 600, letterSpacing: '-0.01em' }}
              >
                Learning Path
              </h2>
              {nextTopic ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate('/session', {
                      state: {
                        planId: journeyData.id,
                        subtopicId: nextTopic.id,
                        title: nextTopic.title,
                        minutes: 25,
                      },
                    })
                  }
                  className="btn-primary sm:hidden"
                >
                  Start session
                </button>
              ) : null}
            </div>

            <div>
              {journeyData.subtopics.map((subtopic, index) => (
                <div key={subtopic.id}>
                  {/* Milestone divider */}
                  {index === 0 || getSegmentLabel(index) !== getSegmentLabel(index - 1) ? (
                    <div className="mb-4 flex items-center gap-3 pl-10">
                      <div className="h-px flex-1 bg-[var(--color-border-light)]" />
                      <span
                        className="uppercase tracking-widest text-[var(--color-text-subtle)]"
                        style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
                      >
                        {getSegmentLabel(index)}
                      </span>
                      <div className="h-px flex-1 bg-[var(--color-border-light)]" />
                    </div>
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
                    onDragEnd={() => { setDraggedSubtopicId(null); setDragOverSubtopicId(null); }}
                    onDragOverTarget={(id) => setDragOverSubtopicId(id)}
                    onDropOver={(id) => handleDropOver(id)}
                  />
                </div>
              ))}
            </div>
          </section>

          {featureFlags.enableExport ? (
            <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => void handleExportCsv()}
                disabled={csvStatus === 'loading'}
                className="btn-secondary"
              >
                {csvStatus === 'loading' ? 'Exporting CSV…' : 'Export CSV'}
              </button>
              <button
                type="button"
                onClick={() => void handleExportPdf()}
                disabled={pdfStatus === 'loading'}
                className="btn-primary"
              >
                {pdfStatus === 'loading' ? 'Exporting PDF…' : 'Export PDF'}
              </button>
            </div>
          ) : null}
        </div>

        {/* Right rail */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-5">
            <RightRailPanel
              notes={railDraft.notes}
              blockers={railDraft.blockers}
              onNotesChange={(value) => setRailDraft((c) => ({ ...c, notes: value }))}
              onBlockersChange={(value) => setRailDraft((c) => ({ ...c, blockers: value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewJourney;
