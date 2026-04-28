import SkillCard from '../components/SkillCard';
import AddTaskButton from '../components/AddTaskButton';
import { useCallback, useEffect, useState } from 'react';
import LearningPlanModal from '../components/LearningPlanModal';
import { useNavigate } from 'react-router-dom';
import { getSkillOverviews } from '../api/learningPlans';
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
import { useUser } from '@clerk/clerk-react';

interface SkillViewModel {
  id: string;
  name: string;
  progress: number;
  total: number;
  completed: number;
  subtopicsLeft: number;
  estimatedHours: number;
  nextTopicName: string | undefined;
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
  const nextTopic = skill.subtopics.find((subtopic) => subtopic.status !== 'completed');

  return {
    id: skill.id,
    name: skill.name,
    progress,
    total,
    completed,
    subtopicsLeft,
    estimatedHours,
    nextTopicName: nextTopic?.name,
    hasStatus: (status: DashboardFilter) => {
      if (status === 'all') return true;
      if (status === 'completed') return completed === total && total > 0;
      if (status === 'in-progress') return completed > 0 && completed < total;
      return completed === 0;
    },
    searchableText: `${skill.name} ${skill.subtopics.map((subtopic) => subtopic.name).join(' ')}`.toLowerCase(),
  };
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getStreakCount = (): number => {
  try {
    const raw = localStorage.getItem('skillmap:streak');
    if (!raw) return 0;
    const { count, lastDate } = JSON.parse(raw) as { count: number; lastDate: string };
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === today || lastDate === yesterday) return count;
    return 0;
  } catch {
    return 0;
  }
};

const RING_RADIUS = 32;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const SkillDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { pushToast, setActivePlanId, setProgressSnapshot } = useAppData();
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

  const streak = getStreakCount();
  const firstName = user?.firstName ?? 'there';

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


  const skillCards = skills
    .map(toSkillViewModel)
    .filter((skill) => {
      const matchesSearch = skill.searchableText.includes(search.toLowerCase().trim());
      const matchesFilter = skill.hasStatus(filter);
      return matchesSearch && matchesFilter;
    })
    .sort((first, second) => {
      if (sort === 'name') return first.name.localeCompare(second.name);
      if (sort === 'remaining') return first.subtopicsLeft - second.subtopicsLeft;
      if (sort === 'hours') return second.estimatedHours - first.estimatedHours;
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
  const ringOffset = RING_CIRCUMFERENCE * (1 - overallProgress / 100);

  useEffect(() => {
    void handleSkillsLoad();
  }, [handleSkillsLoad]);

  const handleAddClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handlePlanGenerated = (plan: LearningPlan) => {
    setActivePlanId(plan.id);
    setProgressSnapshot(plan.id, calculateProgressSummary(plan));
    navigate('/journey');
    handleCloseModal();
  };

  const hasSkills = skills.length > 0;

  return (
    <div className="min-h-screen w-full overflow-y-auto page-enter">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        {/* Personalized greeting */}
        <header className="mb-10 fade-in-up">
          <h1
            className="mb-1 tracking-tight text-[var(--color-text)]"
            style={{ fontSize: 'var(--text-display)', fontWeight: 300 }}
          >
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-body)' }}>
            {hasSkills
              ? `You have ${skills.length} learning ${skills.length === 1 ? 'track' : 'tracks'} in progress`
              : 'Ready to start your first learning journey?'}
          </p>
        </header>

        {/* Main grid */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            {/* Featured hero card — only when skills exist */}
            {loadStatus === 'success' && focusSkill && !focusSkill.hasStatus('completed') ? (
              <section className="glass-card mb-8 p-6 sm:p-8 fade-in-up" style={{ animationDelay: '60ms' }}>
                <p
                  className="mb-1 uppercase tracking-widest text-[var(--color-text-subtle)]"
                  style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
                >
                  Continue where you left off
                </p>
                <h2
                  className="mb-2 tracking-tight text-[var(--color-text)]"
                  style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
                >
                  {focusSkill.name}
                </h2>
                <p className="mb-6 text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-body)' }}>
                  {focusSkill.progress}% complete · {focusSkill.subtopicsLeft} topics remaining
                  {focusSkill.nextTopicName ? ` · Next: ${focusSkill.nextTopicName}` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/session', {
                        state: {
                          title: focusSkill.nextTopicName ?? focusSkill.name,
                          minutes: 25,
                        },
                      })
                    }
                    className="btn-primary"
                  >
                    Start 25-min session
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/journey')}
                    className="btn-secondary"
                  >
                    View journey
                  </button>
                </div>
              </section>
            ) : null}

            {/* Skills section */}
            <section>
              {hasSkills ? (
                <div className="mb-5 flex items-center justify-between">
                  <h2
                    className="text-[var(--color-text)]"
                    style={{ fontSize: 'var(--text-subheading)', fontWeight: 600 }}
                  >
                    Your Skills
                  </h2>
                </div>
              ) : null}

              {loadStatus === 'success' && skillCards.length > 4 ? (
                <DashboardControls
                  search={search}
                  filter={filter}
                  sort={sort}
                  onSearchChange={setSearch}
                  onFilterChange={setFilter}
                  onSortChange={setSort}
                  compact
                />
              ) : null}

              {loadStatus === 'loading' ? <LoadingSkeleton variant="cards" /> : null}

              {loadStatus === 'error' && loadError ? (
                <ErrorState message={loadError} onRetry={() => void handleSkillsLoad()} />
              ) : null}

              {loadStatus === 'success' && !hasSkills ? (
                <EmptyState
                  title="Start building your learning path"
                  description="SkillMap creates personalized roadmaps, tracks your progress with 25-minute focus sessions, and helps you learn deliberately — not randomly."
                  actionLabel="Create your first plan"
                  onAction={handleAddClick}
                  icon={
                    <svg className="h-10 w-10 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                />
              ) : null}

              {loadStatus === 'success' && hasSkills && skillCards.length === 0 ? (
                <EmptyState
                  title="No matches found"
                  description="Try adjusting your search or filter to find your skills."
                  actionLabel="Reset Filters"
                  onAction={() => {
                    setSearch('');
                    setFilter('all');
                    setSort('progress');
                  }}
                />
              ) : null}

              {loadStatus === 'success' && skillCards.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                        nextTopicName={skill.nextTopicName}
                        onContinue={() => navigate('/journey')}
                        disableActions={false}
                        variant={variant}
                        animationDelayMs={Math.min(index * 50, 250)}
                      />
                    );
                  })}
                </div>
              ) : null}
            </section>
          </div>

          {/* Sidebar — progress hub */}
          {hasSkills ? (
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-5">
                {/* Progress ring card */}
                <div className="glass-card p-5 fade-in-up" style={{ animationDelay: '120ms' }}>
                  <p
                    className="mb-4 uppercase tracking-widest text-[var(--color-text-subtle)]"
                    style={{ fontSize: 'var(--text-overline)', fontWeight: 600 }}
                  >
                    Overall Progress
                  </p>
                  <div className="flex items-center gap-5">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r={RING_RADIUS}
                          fill="none"
                          stroke="var(--color-border-light)"
                          strokeWidth="5"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r={RING_RADIUS}
                          fill="none"
                          stroke="var(--color-accent)"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={RING_CIRCUMFERENCE}
                          strokeDashoffset={ringOffset}
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-[var(--color-text)]"
                          style={{ fontSize: 'var(--text-subheading)', fontWeight: 600 }}
                        >
                          {overallProgress}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[var(--color-text)]" style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}>
                        {completedTopics} of {totalTopics}
                      </p>
                      <p className="text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-caption)' }}>
                        topics completed
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-2 border-t border-[var(--color-border-light)] pt-4" style={{ fontSize: 'var(--text-caption)' }}>
                    <div className="flex items-center justify-between">
                      <dt className="text-[var(--color-text-muted)]">Active tracks</dt>
                      <dd className="text-[var(--color-text)]" style={{ fontWeight: 500 }}>{activeTracks}</dd>
                    </div>
                    {streak > 0 ? (
                      <div className="flex items-center justify-between">
                        <dt className="text-[var(--color-text-muted)]">Streak</dt>
                        <dd className="flex items-center gap-1 text-[var(--color-streak)]" style={{ fontWeight: 500 }}>
                          🔥 {streak} day{streak !== 1 ? 's' : ''}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                {/* Quick action */}
                <button
                  type="button"
                  onClick={() => navigate('/journey')}
                  className="btn-primary w-full"
                >
                  Continue Journey
                </button>
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      <AddTaskButton onClick={handleAddClick} hidden={isModalOpen || !hasSkills} />
      <LearningPlanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlanGenerated={handlePlanGenerated}
      />
    </div>
  );
};

export default SkillDashboard;
