import SkillCard from '../components/SkillCard';
import AddTaskButton from '../components/AddTaskButton';
import { useCallback, useEffect, useState } from 'react';
import LearningPlanModal from '../components/LearningPlanModal';
import { useNavigate } from 'react-router-dom';
import { getSkillOverviews, markSkillComplete } from '../api/learningPlans';
import type { LearningPlan, SkillOverview } from '../types/domain';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { useAppData } from '../state/AppDataProvider';
import DashboardControls, {
  type DashboardFilter,
  type DashboardSort,
} from '../components/dashboard/DashboardControls';
import { calculateProgressSummary } from '../utils/progress';

interface SkillViewModel {
  id: string;
  name: string;
  progress: number;
  total: number;
  completed: number;
  subtopicsLeft: number;
  estimatedHours: number;
  hasStatus: (status: DashboardFilter) => boolean;
  searchableText: string;
}

type SkillCardVariant = 'primary' | 'secondary' | 'compact';

const toSkillViewModel = (skill: SkillOverview): SkillViewModel => {
  const total = skill.subtopics.length;
  const completed = skill.subtopics.filter((subtopic) => subtopic.status === 'completed').length;
  const subtopicsLeft = total - completed;
  const estimatedHours = total * 3;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    id: skill.id,
    name: skill.name,
    progress,
    total,
    completed,
    subtopicsLeft,
    estimatedHours,
    hasStatus: (status: DashboardFilter) => {
      if (status === 'all') {
        return true;
      }

      if (status === 'completed') {
        return completed === total && total > 0;
      }

      if (status === 'in-progress') {
        return completed > 0 && completed < total;
      }

      return completed === 0;
    },
    searchableText: `${skill.name} ${skill.subtopics.map((subtopic) => subtopic.name).join(' ')}`.toLowerCase(),
  };
};

const SkillDashboard = () => {
  const navigate = useNavigate();
  const { pushToast, setActivePlanId, setProgressSnapshot, activePlanId, progressSnapshots } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skills, setSkills] = useState<SkillOverview[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<DashboardFilter>('all');
  const [sort, setSort] = useState<DashboardSort>('progress');
  const {
    execute: loadSkills,
    status: loadStatus,
    error: loadError,
  } = useAsyncAction(getSkillOverviews);
  const {
    execute: completeSkill,
    status: completeStatus,
  } = useAsyncAction(markSkillComplete);

  const handleSkillsLoad = useCallback(async () => {
    try {
      const response = await loadSkills();
      setSkills(response);
    } catch {
      pushToast({
        type: 'error',
        message: 'Unable to load skills. Please retry.',
      });
    }
  }, [loadSkills, pushToast]);

  const handleMarkSkillComplete = useCallback(
    async (skillId: string) => {
      const previousSkills = skills;
      const optimisticSkills = skills.map((skill) =>
        skill.id === skillId
          ? {
              ...skill,
              subtopics: skill.subtopics.map((subtopic) => ({
                ...subtopic,
                status: 'completed' as const,
              })),
            }
          : skill,
      );

      setSkills(optimisticSkills);

      try {
        const updatedSkill = await completeSkill(skillId);
        setSkills((current) =>
          current.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill)),
        );
        pushToast({
          type: 'success',
          message: `${updatedSkill.name} marked as complete.`,
        });
      } catch {
        setSkills(previousSkills);
        pushToast({
          type: 'error',
          message: 'Could not mark skill as complete. Please try again.',
        });
      }
    },
    [completeSkill, pushToast, skills],
  );

  const skillCards = skills
    .map(toSkillViewModel)
    .filter((skill) => {
      const matchesSearch = skill.searchableText.includes(search.toLowerCase().trim());
      const matchesFilter = skill.hasStatus(filter);
      return matchesSearch && matchesFilter;
    })
    .sort((first, second) => {
      if (sort === 'name') {
        return first.name.localeCompare(second.name);
      }

      if (sort === 'remaining') {
        return first.subtopicsLeft - second.subtopicsLeft;
      }

      if (sort === 'hours') {
        return second.estimatedHours - first.estimatedHours;
      }

      return second.progress - first.progress;
    });

  const totalTopics = skills.reduce((count, skill) => count + skill.subtopics.length, 0);
  const completedTopics = skills.reduce(
    (count, skill) => count + skill.subtopics.filter((subtopic) => subtopic.status === 'completed').length,
    0,
  );
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const activeTracks = skills.filter((skill) =>
    skill.subtopics.some((subtopic) => subtopic.status === 'in-progress'),
  ).length;
  const focusSkill = skillCards[0] ?? null;
  const sprintCandidates = skillCards.slice(0, 3);
  const activePlanSnapshot = activePlanId ? progressSnapshots[activePlanId] : undefined;

  useEffect(() => {
    void handleSkillsLoad();
  }, [handleSkillsLoad]);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handlePlanGenerated = (plan: LearningPlan) => {
    setActivePlanId(plan.id);
    setProgressSnapshot(plan.id, calculateProgressSummary(plan));
    navigate('/journey');
    handleCloseModal();
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gray-50/20">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_290px] lg:gap-8 lg:px-8 lg:py-16">
        <div>
          <div className="mb-7 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-muted)] sm:mb-10">
            <a className="rounded-full bg-[var(--color-accent-soft)] px-4 py-1.5 text-[var(--color-accent)]" href="#today-board">Today</a>
            <a className="rounded-full bg-white px-4 py-1.5" href="#roadmap-board">Roadmap</a>
            <a className="rounded-full bg-white px-4 py-1.5" href="#insights-board">Insights</a>
          </div>

          <section id="today-board" className="mb-12 animate-[fadeIn_300ms_ease-out]">
            <h1 className="mb-3 text-3xl font-light tracking-tight text-gray-900 sm:text-4xl">Today Board</h1>
            <p className="mb-6 max-w-2xl text-sm text-[var(--color-text-muted)] sm:text-base">
              Start where you left off. Keep the pace steady with a focused plan for this week.
            </p>

            {focusSkill ? (
              <SkillCard
                skillName={focusSkill.name}
                progress={focusSkill.progress}
                subtopicsLeft={focusSkill.subtopicsLeft}
                totalSubtopics={focusSkill.total}
                estimatedHours={focusSkill.estimatedHours}
                onContinue={() => navigate('/journey')}
                onComplete={() => void handleMarkSkillComplete(focusSkill.id)}
                disableActions={completeStatus === 'loading'}
                variant="primary"
              />
            ) : null}
          </section>

          <section className="mb-12">
            <h2 className="mb-5 text-xl font-light text-[var(--color-text)]">Sprint Goals</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Track momentum</p>
                <p className="mt-2 text-2xl font-light text-[var(--color-text)]">{activeTracks}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">active tracks this week</p>
              </article>
              <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Completion goal</p>
                <p className="mt-2 text-2xl font-light text-[var(--color-text)]">{overallProgress}%</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">overall completion progress</p>
              </article>
              <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Topic target</p>
                <p className="mt-2 text-2xl font-light text-[var(--color-text)]">{completedTopics}/{totalTopics}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">topics completed so far</p>
              </article>
            </div>
          </section>

          <section id="roadmap-board" className="mb-12">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-light text-[var(--color-text)]">Roadmap</h2>
              <button
                type="button"
                onClick={() => navigate('/journey')}
                className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
              >
                Open Journey
              </button>
            </div>

            <DashboardControls
              search={search}
              filter={filter}
              sort={sort}
              onSearchChange={setSearch}
              onFilterChange={setFilter}
              onSortChange={setSort}
              compact
            />

            {loadStatus === 'loading' ? <LoadingSkeleton variant="cards" /> : null}

            {loadStatus === 'error' && loadError ? (
              <ErrorState message={loadError} onRetry={() => void handleSkillsLoad()} />
            ) : null}

            {loadStatus === 'success' && skills.length === 0 ? (
              <EmptyState
                title="No skills tracked yet"
                description="Generate a learning plan to populate your dashboard and start tracking progress."
                actionLabel="Generate Plan"
                onAction={handleAddClick}
              />
            ) : null}

            {loadStatus === 'success' && skills.length > 0 && skillCards.length === 0 ? (
              <EmptyState
                title="No matches found"
                description="Try adjusting your search, filter, or sort options to find your skills."
                actionLabel="Reset Filters"
                onAction={() => {
                  setSearch('');
                  setFilter('all');
                  setSort('progress');
                }}
              />
            ) : null}

            {loadStatus === 'success' && skillCards.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                {skillCards.map((skill, index) => {
                  const variant: SkillCardVariant =
                    index === 0 ? 'primary' : index < 3 ? 'secondary' : 'compact';

                  return (
                    <SkillCard
                      key={skill.id}
                      skillName={skill.name}
                      progress={skill.progress}
                      subtopicsLeft={skill.subtopicsLeft}
                      totalSubtopics={skill.total}
                      estimatedHours={skill.estimatedHours}
                      onContinue={() => navigate('/journey')}
                      onComplete={() => void handleMarkSkillComplete(skill.id)}
                      disableActions={completeStatus === 'loading'}
                      variant={variant}
                    />
                  );
                })}
              </div>
            ) : null}
          </section>

          <section id="insights-board" className="mb-4">
            <h2 className="mb-5 text-xl font-light text-[var(--color-text)]">Insights</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">This week focus</p>
                <p className="mt-2 text-base text-[var(--color-text)]">
                  {focusSkill
                    ? `Continue ${focusSkill.name} to unlock ${focusSkill.subtopicsLeft} remaining topics.`
                    : 'Generate your first plan to receive guidance.'}
                </p>
              </article>
              <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Sprint candidates</p>
                <p className="mt-2 text-base text-[var(--color-text)]">
                  {sprintCandidates.length > 0
                    ? sprintCandidates.map((item) => item.name).join(', ')
                    : 'No candidates available yet.'}
                </p>
              </article>
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Progress Rail</h3>
            <p className="mt-3 text-3xl font-light text-[var(--color-text)]">{overallProgress}%</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">overall learning completion</p>
            <div className="mt-4 h-2 rounded-full bg-[var(--color-border)]">
              <div className="h-2 rounded-full bg-[var(--color-accent)]" style={{ width: `${overallProgress}%` }} />
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[var(--color-text-muted)]">Completed topics</dt>
                <dd className="text-[var(--color-text)]">{completedTopics}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[var(--color-text-muted)]">Active tracks</dt>
                <dd className="text-[var(--color-text)]">{activeTracks}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[var(--color-text-muted)]">Active journey</dt>
                <dd className="text-[var(--color-text)]">
                  {activePlanSnapshot ? `${activePlanSnapshot.completionPercentage}%` : 'Not started'}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => navigate('/journey')}
              className="mt-6 w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[var(--color-accent-strong)]"
            >
              Continue Journey
            </button>
          </div>
        </aside>
      </div>

      <button
        type="button"
        onClick={() => navigate('/journey')}
        className="fixed bottom-4 left-4 z-40 rounded-full border border-[var(--color-border)] bg-white/95 px-4 py-2 text-sm text-[var(--color-text)] shadow-[var(--shadow-soft)] lg:hidden"
      >
        Progress {overallProgress}%
      </button>

      <AddTaskButton onClick={handleAddClick} />
      <LearningPlanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlanGenerated={handlePlanGenerated}
      />
    </div>
  );
};

export default SkillDashboard;
