import { Request, Response, NextFunction } from 'express';
import { learningPlanService } from '../services/learningPlanService';
import { LearningGoalInput } from '../utils/aiPrompt';

/**
 * Controller handles incoming requests, extracts parameters, and 
 * delegates to the core services.
 */
export const createLearningPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input: LearningGoalInput = req.body;
    
    // We expect auth middleware to attach userId
    // Currently hardcoding a dummy ID until Clerk auth middleware is added
    const userId = (req as any).userId || 'dummy-user-123';

    if (!input.topic) {
      res.status(400).json({ error: 'Missing required parameter: topic' });
      return;
    }

    const newPlan = await learningPlanService.createPlan(userId, input);

    // Mongoose maps _id -> id internally when using toJSON, but let's be explicit
    // to match the frontend expectations perfectly.
    const serializedPlan = newPlan.toJSON();
    serializedPlan.id = serializedPlan._id.toString();

    res.status(201).json(serializedPlan);
  } catch (error) {
    console.error('[Controller Error - createLearningPlan]', error);
    next(error); // Pass to global error handler
  }
};

export const getUserPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId || 'dummy-user-123';
    const plans = await learningPlanService.getUserPlans(userId);
    
    res.status(200).json(plans);
  } catch (error) {
    console.error('[Controller Error - getUserPlans]', error);
    next(error);
  }
};

export const markTopicComplete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const planId = req.params.planId as string;
    const topicId = req.params.topicId as string;
    const userId = (req as any).userId || 'dummy-user-123';

    const updatedPlan = await learningPlanService.markTopicComplete(userId, planId, topicId);
    
    if (!updatedPlan) {
      res.status(404).json({ error: 'Learning Plan not found.' });
      return;
    }

    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error('[Controller Error - markTopicComplete]', error);
    next(error);
  }
};
