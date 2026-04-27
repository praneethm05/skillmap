import { LearningPlan, ILearningPlan, IPlanSubtopic } from '../models/LearningPlan';
import { aiGenerationService } from './aiService';
import { LearningGoalInput } from '../utils/aiPrompt';
import { randomUUID } from 'crypto';

export class LearningPlanService {
  /**
   * Generates a plan using the local LLM and persists it to the database.
   */
  async createPlan(userId: string, input: LearningGoalInput): Promise<ILearningPlan> {
    const aiResponse = await aiGenerationService.generatePlan(input);

    const subtopics: IPlanSubtopic[] = aiResponse.subtopics.map((topic, index) => ({
      id: randomUUID(),
      title: topic.title,
      description: topic.description,
      isCompleted: false,
      estimatedHours: topic.estimatedHours,
      resources: topic.resources,
    }));

    const plan = new LearningPlan({
      userId,
      courseName: aiResponse.courseName,
      subtopics,
      // Aggregates will be calculated via Mongoose pre('save') middleware
    });

    return await plan.save();
  }

  /**
   * Fetches all plans belonging to a specific user.
   */
  async getUserPlans(userId: string): Promise<ILearningPlan[]> {
    // Return plans sorted by most recently created
    return await LearningPlan.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Retrieves a single learning plan by ID, verifying ownership.
   */
  async getPlanById(userId: string, planId: string): Promise<ILearningPlan | null> {
    return await LearningPlan.findOne({ _id: planId, userId });
  }

  /**
   * Toggles the completion status of a specific subtopic inside a plan.
   */
  async markTopicComplete(userId: string, planId: string, topicId: string): Promise<ILearningPlan | null> {
    const plan = await this.getPlanById(userId, planId);
    if (!plan) return null;

    const topic = plan.subtopics.find((t) => t.id === topicId);
    if (!topic) {
      throw new Error(`Topic with id ${topicId} not found in this plan.`);
    }

    topic.isCompleted = true; // Or toggle it? Frontend says "markComplete", let's assume one-way true

    // Must call save() to trigger the pre('save') aggregate recalcs
    return await plan.save();
  }
}

export const learningPlanService = new LearningPlanService();
