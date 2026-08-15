import { Router as ExpressRouter } from 'express';
import { generateGoalProgram, checkGoalProgress } from '../controllers/goalAi.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  goalProgramAiInputSchema,
  goalProgressAiInputSchema,
} from '../validations/fitnessGoalAi.validation';

const router = ExpressRouter();

router.post('/goal-program', validate(goalProgramAiInputSchema), generateGoalProgram);
router.get('/goal-progress', validate(goalProgressAiInputSchema), checkGoalProgress);

export default router;
