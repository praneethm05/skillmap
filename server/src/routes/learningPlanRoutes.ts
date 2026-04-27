import { Router } from 'express';
import { createLearningPlan, getUserPlans, markTopicComplete } from '../controllers/learningPlanController';

const router = Router();

/**
 * Route: POST /api/v1/learning-plans/generate
 * Description: Calls local LLM to generate a structured curriculum
 */
router.post('/generate', createLearningPlan);

/**
 * Route: GET /api/v1/learning-plans
 * Description: Fetches all active plans for the authenticated user
 */
router.get('/', getUserPlans);

/**
 * Route: PATCH /api/v1/learning-plans/:planId/topics/:topicId/complete
 * Description: Marks a specific subtopic inside a plan as complete
 */
router.patch('/:planId/topics/:topicId/complete', markTopicComplete);

export default router;
