import { Request, Response, NextFunction } from 'express';
import { learningPlanService } from '../services/learningPlanService';
import { LearningGoalInput } from '../utils/aiPrompt';

export const createLearningPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input: LearningGoalInput = req.body;
    
    const userId = (req as any).auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: No user session found.' });
      return;
    }

    if (!input.topic) {
      res.status(400).json({ error: 'Missing required parameter: topic' });
      return;
    }

    const newPlan = await learningPlanService.createPlan(userId, input);

    const serializedPlan = newPlan.toJSON();
    serializedPlan.id = serializedPlan._id.toString();

    res.status(201).json(serializedPlan);
  } catch (error) {
    console.error('[Controller Error - createLearningPlan]', error);
    next(error); 
  }
};

export const getUserPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const plans = await learningPlanService.getUserPlans(userId);
    
    // Convert to matching frontend schema
    const serializedPlans = plans.map(p => {
      const sp = p.toJSON();
      sp.id = sp._id.toString();
      return sp;
    });

    res.status(200).json(serializedPlans);
  } catch (error) {
    console.error('[Controller Error - getUserPlans]', error);
    next(error);
  }
};

export const getPlanById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId;
    const planId = req.params.planId as string;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const plan = await learningPlanService.getPlanById(userId, planId);
    
    if (!plan) {
      res.status(404).json({ error: 'Learning Plan not found.' });
      return;
    }

    const serializedPlan = plan.toJSON();
    serializedPlan.id = serializedPlan._id.toString();

    res.status(200).json(serializedPlan);
  } catch (error) {
    console.error('[Controller Error - getPlanById]', error);
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
    const userId = (req as any).auth?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updatedPlan = await learningPlanService.markTopicComplete(userId, planId, topicId);
    
    if (!updatedPlan) {
      res.status(404).json({ error: 'Learning Plan not found.' });
      return;
    }

    const serializedPlan = updatedPlan.toJSON();
    serializedPlan.id = serializedPlan._id.toString();

    res.status(200).json(serializedPlan);
  } catch (error) {
    console.error('[Controller Error - markTopicComplete]', error);
    next(error);
  }
};
