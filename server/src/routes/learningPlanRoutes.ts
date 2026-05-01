import { Router } from 'express';
import { createLearningPlan, getUserPlans, getPlanById, toggleTopicComplete } from '../controllers/learningPlanController';

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
 * Route: GET /api/v1/learning-plans/:planId
 * Description: Fetches a single learning plan by ID
 */
router.get('/:planId', getPlanById);

/**
 * Route: PATCH /api/v1/learning-plans/:planId/subtopics/:topicId/toggle
 * Description: Toggles the completion state of a subtopic
 */
router.patch('/:planId/subtopics/:topicId/toggle', toggleTopicComplete);

export default router;
