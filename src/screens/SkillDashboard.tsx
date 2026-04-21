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
      
      {/* Clean, spacious layout with generous margins */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        
        {/* Simple, elegant header */}
        <div className="mb-12 text-center sm:mb-16 animate-[fadeIn_300ms_ease-out]">
          <h1 className="mb-4 text-3xl font-light tracking-tight text-gray-900 sm:text-4xl">
            Learning Progress
          </h1>
          <p className="mx-auto max-w-2xl text-base font-normal text-gray-600 sm:text-lg">
            Track your journey through technology skills with clarity and focus.
          </p>
        </div>

        <DashboardControls
          search={search}
          filter={filter}
          sort={sort}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onSortChange={setSort}
        />

        {/* Clean grid with optimal spacing */}
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
      </div>


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
