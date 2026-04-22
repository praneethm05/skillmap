import type { LearningPlan } from '../types/domain';

export interface ShareLink {
  id: string;
  url: string;
  createdAt: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  date: string;
  detail: string;
}

export interface WeeklyCheckIn {
  weekLabel: string;
  completedTopics: number;
  completedHours: number;
  consistencyScore: number;
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const buildToken = (): string =>
  `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

export const createMockPrivateShareLink = async (plan: LearningPlan): Promise<ShareLink> => {
  await delay(420);
  const token = buildToken();

  return {
    id: token,
    url: `https://skillmap.app/s/${token}?plan=${encodeURIComponent(plan.id)}`,
    createdAt: new Date().toISOString(),
  };
};

export const buildAchievementJournal = (plan: LearningPlan): AchievementEntry[] => {
  return plan.subtopics
    .filter((subtopic) => subtopic.isCompleted)
    .map((subtopic, index) => ({
      id: subtopic.id,
      title: `Completed ${subtopic.title}`,
      date: new Date(Date.now() - index * 3 * 24 * 60 * 60 * 1000).toISOString(),
      detail: `${subtopic.estimatedHours}h invested in focused practice`,
    }))
    .slice(0, 8);
};

export const createWeeklyCheckIn = (plan: LearningPlan): WeeklyCheckIn => {
  const completed = plan.subtopics.filter((subtopic) => subtopic.isCompleted);
  const completedHours = completed.reduce((sum, subtopic) => sum + subtopic.estimatedHours, 0);

  return {
    weekLabel: 'Current Week',
    completedTopics: completed.length,
    completedHours,
    consistencyScore: Math.min(100, Math.max(40, completed.length * 12)),
  };
};

export const buildMentorSummaryPayload = (plan: LearningPlan) => {
  const completedTopics = plan.subtopics.filter((subtopic) => subtopic.isCompleted).length;

  return {
    planId: plan.id,
    courseName: plan.courseName,
    completedTopics,
    totalTopics: plan.totalTopics,
    completionPercentage:
      plan.totalTopics > 0 ? Math.round((completedTopics / plan.totalTopics) * 100) : 0,
    generatedAt: new Date().toISOString(),
  };
};
