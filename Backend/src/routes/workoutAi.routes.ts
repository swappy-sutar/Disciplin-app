import { Router as ExpressRouter } from 'express';
import * as workoutAiController from '../controllers/workoutAi.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  workoutSplitAiInputSchema,
  workoutSessionAiInputSchema,
  parseWorkoutLogSchema,
  coachChatSchema,
} from '../validations/workoutAi.validation';

const router = ExpressRouter();

router.post('/workout-split', validate(workoutSplitAiInputSchema), workoutAiController.generateWorkoutSplit);
router.post('/workout-session', validate(workoutSessionAiInputSchema), workoutAiController.generateWorkoutSession);
router.get('/workout-insights', workoutAiController.getWorkoutInsights);
router.post('/parse-workout-log', validate(parseWorkoutLogSchema), workoutAiController.parseWorkoutLog);
router.get('/workout-plateau-check', workoutAiController.checkWorkoutPlateau);
router.post('/detect-equipment', workoutAiController.detectEquipment);
router.post('/coach-chat', validate(coachChatSchema), workoutAiController.coachChat);
router.post('/regenerate-split', workoutAiController.regenerateSplit);

export default router;
