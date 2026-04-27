export type SkillStatus = 'not-started' | 'in-progress' | 'completed';

export interface SkillSubtopic {
  id: string;
  name: string;
  status: SkillStatus;
}

export interface SkillOverview {
  id: string;
  name: string;
  subtopics: SkillSubtopic[];
}

export interface LearningGoalInput {
  topic: string;
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
  weeklyHours?: number;
  targetWeeks?: number;
  forceFailure?: boolean;
}

export type ResourceType = 'video' | 'article' | 'documentation' | 'course';

export interface LearningResource {
  title: string;
  type: ResourceType;
  url: string;
}

export interface PlanSubtopic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  estimatedHours: number;
  resources?: LearningResource[];
}

export interface LearningPlan {
  id: string;
  courseName: string;
  dateCreated: string;
  totalTopics: number;
  completedTopics: number;
  estimatedTotalHours: number;
  subtopics: PlanSubtopic[];
}

export interface ProgressSummary {
  totalTopics: number;
  completedTopics: number;
  completionPercentage: number;
  completedHours: number;
  estimatedTotalHours: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}
