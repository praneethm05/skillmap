import { randomUUID } from 'crypto';

export interface LearningGoalInput {
  topic: string;
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
  weeklyHours?: number;
  targetWeeks?: number;
}

export const buildPrompt = (input: LearningGoalInput): string => {
  const { topic, currentLevel = 'beginner', weeklyHours = 5, targetWeeks = 4 } = input;
  const totalHours = weeklyHours * targetWeeks;

  return `
You are an expert curriculum designer. Create a structured learning plan for a ${currentLevel} learner studying "${topic}".
They have approximately ${totalHours} total hours to dedicate to this over ${targetWeeks} weeks.

Break the topic down into logical, sequential subtopics. For each subtopic, provide 1 to 3 HIGH QUALITY learning resources (videos, articles, official documentation).
DO NOT invent or hallucinate URLs. Instead, use highly reliable search query URLs (e.g., YouTube search, Google search for official docs) if you are unsure of the exact link.

Return ONLY a valid JSON object matching the exact schema below. Do not include markdown formatting like \`\`\`json.

SCHEMA:
{
  "courseName": "String - an inspiring title for this course",
  "subtopics": [
    {
      "title": "String - clear, actionable subtopic title",
      "description": "String - 1-2 sentences explaining what will be learned",
      "estimatedHours": Number - realistic hours to complete this (minimum 1),
      "resources": [
        {
          "title": "String - name of the resource",
          "type": "String - exactly one of: 'video', 'article', 'documentation', 'course'",
          "url": "String - MUST be a valid URL (use search query URLs if uncertain)"
        }
      ]
    }
  ]
}
`;
};
