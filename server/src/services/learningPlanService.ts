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
      title: topic.title || `Topic ${index + 1}`,
      description: topic.description || 'Learn the foundational concepts of this topic.',
      isCompleted: false,
      estimatedHours: topic.estimatedHours || 1,
      resources: Array.isArray(topic.resources) ? topic.resources.map(r => ({
        title: r.title || 'Helpful Resource',
        type: r.type || 'article',
        url: r.url || `https://www.google.com/search?q=${encodeURIComponent(topic.title || input.topic)}`
      })) : [],
    }));

    const plan = new LearningPlan({
      userId,
      courseName: aiResponse.courseName,
      subtopics,
      totalTopics: subtopics.length,
      estimatedTotalHours: subtopics.reduce((acc, topic) => acc + topic.estimatedHours, 0)
      // Aggregates will also be calculated via Mongoose pre('save') middleware
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
   * Updates an entire plan, including subtopic structures (drag & drop reordering, renaming, etc).
   */
  async updatePlan(userId: string, planId: string, planData: Partial<ILearningPlan>): Promise<ILearningPlan | null> {
    const plan = await this.getPlanById(userId, planId);
    if (!plan) return null;

    if (planData.courseName) plan.courseName = planData.courseName;
    if (planData.subtopics) {
      plan.subtopics = planData.subtopics as any;
    }
    
    return await plan.save();
  }

  /**
   * Toggles the completion status of a specific subtopic inside a plan.
   */
  async toggleTopicComplete(userId: string, planId: string, topicId: string, isCompleted: boolean): Promise<ILearningPlan | null> {
    const plan = await this.getPlanById(userId, planId);
    if (!plan) return null;

    const topic = plan.subtopics.find((t) => t.id === topicId);
    if (!topic) {
      throw new Error(`Topic with id ${topicId} not found in this plan.`);
    }

    topic.isCompleted = isCompleted;

    // Must call save() to trigger the pre('save') aggregate recalcs
    return await plan.save();
  }
}

export const learningPlanService = new LearningPlanService();
