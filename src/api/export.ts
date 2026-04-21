import type { LearningPlan } from '../types/domain';

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), ms);
  });

export const exportProgressCsv = async (plan: LearningPlan): Promise<string> => {
  await delay(400);

  const rows = [
    ['topic', 'completed', 'estimatedHours'],
    ...plan.subtopics.map((subtopic) => [
      `"${subtopic.title.replace(/"/g, '""')}"`,
      String(subtopic.isCompleted),
      String(subtopic.estimatedHours),
    ]),
  ];

  return rows.map((row) => row.join(',')).join('\n');
};

export const exportProgressPdf = async (_plan: LearningPlan): Promise<void> => {
  await delay(500);
};
