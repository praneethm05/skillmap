import { dummyJourneyData } from '../data/journeyData';
import { skillData } from '../data/skills';
import type { ApiClient, ApiRequestOptions } from './client';
import type {
  LearningGoalInput,
  LearningPlan,
  PlanSubtopic,
  SkillOverview,
  UserProfile,
} from '../types/domain';

interface MockStore {
  skills: SkillOverview[];
  plan: LearningPlan;
  user: UserProfile;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const mockStore: MockStore = {
  skills: clone(skillData),
  plan: clone(dummyJourneyData),
  user: {
    id: 'mock-user-1',
    email: 'learner@skillmap.dev',
    displayName: 'SkillMap Learner',
  },
};

const simulateLatency = async (options?: ApiRequestOptions): Promise<void> => {
  if (options?.signal?.aborted) {
    throw new DOMException('Request was aborted', 'AbortError');
  }

  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      if (options?.signal?.aborted) {
        reject(new DOMException('Request was aborted', 'AbortError'));
        return;
      }

      resolve();
    }, 120);

    options?.signal?.addEventListener('abort', () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException('Request was aborted', 'AbortError'));
    });
  });
};

const toPlanSubtopic = (topic: string, index: number): PlanSubtopic => ({
  id: `generated-${index + 1}`,
  title: `${topic} - Module ${index + 1}`,
  description: `Foundational concepts and practice track ${index + 1} for ${topic}.`,
  isCompleted: false,
  estimatedHours: index % 2 === 0 ? 3 : 4,
});

const generateLearningPlan = (input: LearningGoalInput): LearningPlan => {
  const normalizedTopic = input.topic.trim();
  const subtopics = Array.from({ length: 8 }, (_, index) =>
    toPlanSubtopic(normalizedTopic, index),
  );
  const estimatedTotalHours = subtopics.reduce(
    (total, subtopic) => total + subtopic.estimatedHours,
    0,
  );

  return {
    id: `journey-${Date.now()}`,
    courseName: `${normalizedTopic} Roadmap`,
    dateCreated: new Date().toISOString().slice(0, 10),
    totalTopics: subtopics.length,
    completedTopics: 0,
    estimatedTotalHours,
    subtopics,
  };
};

const parsePath = (path: string): string[] =>
  path
    .split('?')[0]
    .split('/')
    .filter(Boolean);

export const mockApiClient: ApiClient = {
  async get<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse> {
    await simulateLatency(options);
    const parts = parsePath(path);

    if (parts[0] === 'skills') {
      return clone(mockStore.skills) as TResponse;
    }

    if (parts[0] === 'learning-plans' && parts[1]) {
      return clone(mockStore.plan) as TResponse;
    }

    if (parts[0] === 'users' && parts[1] === 'me') {
      return clone(mockStore.user) as TResponse;
    }

    throw new Error(`Mock GET route not implemented: ${path}`);
  },

  async post<TBody, TResponse>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    await simulateLatency(options);
    const parts = parsePath(path);

    if (parts[0] === 'learning-plans' && parts[1] === 'generate') {
      const input = body as LearningGoalInput;

      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 900);
      });

      if (input.forceFailure || input.topic.toLowerCase().includes('[fail]')) {
        throw new Error('Mock generation failed. Please retry.');
      }

      const plan = generateLearningPlan(input);
      mockStore.plan = plan;
      return clone(plan) as TResponse;
    }

    throw new Error(`Mock POST route not implemented: ${path}`);
  },

  async patch<TBody, TResponse>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    await simulateLatency(options);
    const parts = parsePath(path);

    if (
      parts[0] === 'learning-plans' &&
      parts[1] &&
      parts[2] === 'subtopics' &&
      parts[3] &&
      parts[4] === 'toggle'
    ) {
      const nextCompleted = Boolean((body as { isCompleted?: boolean }).isCompleted);
      const subtopics = mockStore.plan.subtopics.map((subtopic) =>
        subtopic.id === parts[3] ? { ...subtopic, isCompleted: nextCompleted } : subtopic,
      );
      const completedTopics = subtopics.filter((subtopic) => subtopic.isCompleted).length;

      mockStore.plan = {
        ...mockStore.plan,
        subtopics,
        completedTopics,
      };

      return clone(mockStore.plan) as TResponse;
    }

    if (parts[0] === 'skills' && parts[1] && parts[2] === 'complete') {
      const updatedSkills = mockStore.skills.map((skill) =>
        skill.id === parts[1]
          ? {
              ...skill,
              subtopics: skill.subtopics.map((subtopic) => ({
                ...subtopic,
                status: 'completed' as const,
              })),
            }
          : skill,
      );

      mockStore.skills = updatedSkills;
      const updatedSkill = updatedSkills.find((skill) => skill.id === parts[1]);
      if (!updatedSkill) {
        throw new Error(`Skill not found for id: ${parts[1]}`);
      }

      return clone(updatedSkill) as TResponse;
    }

    throw new Error(`Mock PATCH route not implemented: ${path}`);
  },
};
